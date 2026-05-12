'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { PLANS } from '@/lib/plans';

export const dynamic = 'force-dynamic';

const NAV = [
  {id:'overview',icon:'📊',label:'Overview'},
  {id:'listings',icon:'🖼️',label:'My Listings'},
  {id:'enquiries',icon:'💬',label:'Enquiries'},
  {id:'profile',icon:'👤',label:'My Profile'},
  {id:'subscription',icon:'💳',label:'Subscription'},
];

const planDetails = Object.fromEntries(PLANS.map(plan => [
  plan.id,
  {
    name: plan.name,
    listings: plan.listings,
    color: plan.color,
    price: `Rs ${plan.monthly.toLocaleString('en-IN')}/mo`,
  },
]));

const SUBSCRIPTION_PROFILE_FIELDS = 'id, full_name, phone, user_type, plan, billing_interval, subscription_status, razorpay_subscription_id, razorpay_plan_id, subscription_current_start, subscription_current_end, subscription_cancel_at_cycle_end, subscription_cancelled_at, subscription_pending_plan, subscription_pending_interval';
const LIVE_SUBSCRIPTION_STATUSES = ['authenticated', 'active'];

function normalizeBillingInterval(interval) {
  return interval === 'annual' ? 'annual' : 'monthly';
}

function normalizeSubscriptionStatus(status) {
  return String(status || 'inactive').trim().toLowerCase();
}

function hasLiveBilling(subscriptionId, status) {
  return !!String(subscriptionId || '').trim() && LIVE_SUBSCRIPTION_STATUSES.includes(normalizeSubscriptionStatus(status));
}

function formatBillingDate(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ProDashboard(){
  const sb = createClient();
  const router = useRouter();
  const [tab,setTab] = useState('overview');
  const [user,setUser] = useState(null);
  const [profile,setProfile] = useState(null);
  const [listings,setListings] = useState([]);
  const [enquiries,setEnquiries] = useState([]);
  const [loading,setLoading] = useState(true);
  const [billingInterval,setBillingInterval] = useState('monthly');
  const [billingBusy,setBillingBusy] = useState('');
  const [billingMessage,setBillingMessage] = useState('');
  const [billingError,setBillingError] = useState('');

  useEffect(()=>{
    sb.auth.getUser().then(async({data})=>{
      if(!data.user){router.push('/auth');return;}
      if(data.user.user_metadata?.role!=='professional'){router.push('/pro-signup?upgrade=1');return;}
      setUser(data.user);
      // Fetch listings, enquiries, and billing profile in parallel.
      const [listingsRes, enquiriesRes, profileRes] = await Promise.all([
        sb.from('listings').select('*').eq('owner_id',data.user.id).order('created_at',{ascending:false}),
        sb.from('enquiries').select('*').eq('professional_id',data.user.id).order('created_at',{ascending:false}),
        sb.from('profiles').select(SUBSCRIPTION_PROFILE_FIELDS).eq('id',data.user.id).single(),
      ]);
      setListings(listingsRes.data||[]);
      setEnquiries(enquiriesRes.data||[]);
      let nextProfile = profileRes.data||null;
      const metadata = data.user.user_metadata || {};
      const currentSubscriptionId = nextProfile?.razorpay_subscription_id || metadata.razorpay_subscription_id;
      const currentStatus = nextProfile?.subscription_status || metadata.subscription_status;
      if(currentSubscriptionId && !hasLiveBilling(currentSubscriptionId, currentStatus)){
        const syncRes = await fetch('/api/razorpay/sync-subscription', {method:'POST'});
        const syncPayload = await syncRes.json().catch(()=>({}));
        if(syncRes.ok && syncPayload.profile) nextProfile = syncPayload.profile;
      }
      setProfile(nextProfile);
      setBillingInterval(normalizeBillingInterval(
        nextProfile?.billing_interval ||
        metadata.billing_interval ||
        metadata.billing
      ));
      setLoading(false);
    });
  },[]);

  async function signOut(){await sb.auth.signOut();router.push('/');}

  async function deleteListing(id){
    if(!confirm('Delete this listing?')) return;
    await sb.from('listings').delete().eq('id',id);
    setListings(prev=>prev.filter(l=>l.id!==id));
  }

  async function markReplied(enqId){
    // Only update if currently 'new' — don't reset already-progressed enquiries
    const enq = enquiries.find(e => e.id === enqId);
    if (!enq || enq.status !== 'new') return;
    setEnquiries(prev => prev.map(e => e.id === enqId ? {...e, status: 'replied'} : e));
    await sb.from('enquiries').update({status:'replied'}).eq('id', enqId);
  }

  function loadRazorpayCheckout(){
    return new Promise(resolve=>{
      if(window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = ()=>resolve(true);
      script.onerror = ()=>resolve(false);
      document.body.appendChild(script);
    });
  }

  async function refreshBillingState(){
    const {data:userData} = await sb.auth.getUser();
    if(userData?.user) setUser(userData.user);
    const userId = userData?.user?.id || user?.id;
    if(!userId) return;
    const {data:profileData} = await sb.from('profiles').select(SUBSCRIPTION_PROFILE_FIELDS).eq('id',userId).single();
    if(profileData){
      setProfile(profileData);
      setBillingInterval(normalizeBillingInterval(profileData.billing_interval));
    }
  }

  async function startOrChangeSubscription(targetPlanId){
    const targetPlan = PLANS.find(p=>p.id===targetPlanId);
    if(!targetPlan) return;

    setBillingBusy(targetPlanId);
    setBillingError('');
    setBillingMessage('');

    try{
      const metadata = user?.user_metadata||{};
      const subscriptionId = profile?.razorpay_subscription_id || metadata.razorpay_subscription_id;
      const status = profile?.subscription_status || metadata.subscription_status;
      const canChangeExisting = hasLiveBilling(subscriptionId, status);
      const endpoint = canChangeExisting ? '/api/razorpay/change-subscription' : '/api/razorpay/create-subscription';

      const res = await fetch(endpoint, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({planId:targetPlanId,billingInterval}),
      });
      const payload = await res.json().catch(()=>({}));
      if(!res.ok) throw new Error(payload.error||'Subscription request failed');

      if(canChangeExisting){
        await refreshBillingState();
        setBillingMessage(payload.scheduleChangeAt === 'cycle_end'
          ? `${targetPlan.name} is scheduled for the end of this billing period.`
          : `Your plan is now ${targetPlan.name}.`
        );
        return;
      }

      const ready = await loadRazorpayCheckout();
      if(!ready) throw new Error('Could not load Razorpay Checkout');

      const options = {
        key: payload.keyId,
        subscription_id: payload.subscriptionId,
        name: 'Homeizz',
        description: `${targetPlan.name} plan - ${billingInterval}`,
        prefill: {
          name: displayName,
          email: user?.email || '',
          contact: profile?.phone || metadata.phone || '',
        },
        notes: {
          homeizz_plan: targetPlanId,
          homeizz_billing_interval: billingInterval,
        },
        theme: { color: targetPlan.color },
        modal: {
          ondismiss: ()=>setBillingBusy(''),
        },
        handler: async (response)=>{
          try{
            const verifyRes = await fetch('/api/razorpay/verify-subscription', {
              method:'POST',
              headers:{'Content-Type':'application/json'},
              body:JSON.stringify(response),
            });
            const verifyPayload = await verifyRes.json().catch(()=>({}));
            if(!verifyRes.ok || !verifyPayload.ok) throw new Error(verifyPayload.error||'Subscription verification failed');
            await refreshBillingState();
            setBillingMessage('Subscription verified. Your billing is connected.');
          }catch(e){
            setBillingError(e.message||'Subscription verification failed');
          }finally{
            setBillingBusy('');
          }
        },
      };

      new window.Razorpay(options).open();
    }catch(e){
      setBillingError(e.message||'Something went wrong');
      setBillingBusy('');
    }
  }

  async function cancelSubscription(){
    if(!confirm('Cancel this subscription at the end of the current billing period?')) return;
    setBillingBusy('cancel');
    setBillingError('');
    setBillingMessage('');
    try{
      const res = await fetch('/api/razorpay/cancel-subscription', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({cancelAtCycleEnd:true}),
      });
      const payload = await res.json().catch(()=>({}));
      if(!res.ok) throw new Error(payload.error||'Could not cancel subscription');
      await refreshBillingState();
      setBillingMessage('Cancellation scheduled. Your listings stay active until the period ends.');
    }catch(e){
      setBillingError(e.message||'Could not cancel subscription');
    }finally{
      setBillingBusy('');
    }
  }

  function waPhone(phone){
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.length === 10) return '91' + digits;
    return digits;
  }

  function waLink(enq){
    const firstName = enq.homeowner_name?.split(' ')[0] || 'there';
    const proj = enq.project_type ? `your ${enq.project_type.toLowerCase()} project` : 'your project';
    const msg = `Hi ${firstName}! Thanks for your enquiry on Homeizz about ${proj}. I'd love to discuss this with you. — ${displayName}`;
    return `https://wa.me/${waPhone(enq.homeowner_phone)}?text=${encodeURIComponent(msg)}`;
  }

  function emailLink(enq){
    const firstName = enq.homeowner_name?.split(' ')[0] || 'there';
    const proj = enq.project_type ? `your ${enq.project_type.toLowerCase()}` : 'your project';
    const subject = 'Re: Your enquiry on Homeizz';
    const body = `Hi ${firstName},\n\nThanks for reaching out via Homeizz about ${proj}. I'd love to discuss this further — when's a good time for a call?\n\nBest regards,\n${displayName}\nvia Homeizz`;
    return `mailto:${enq.homeowner_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  if(loading) return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F5F0EB'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:'var(--fd)',fontSize:'1.5rem',color:'var(--t)',marginBottom:8}}>Homeizz</div>
        <div style={{color:'var(--tlt)',fontSize:'.9rem'}}>Loading dashboard...</div>
      </div>
    </div>
  );

  const meta = user?.user_metadata||{};
  const profileMeta = Object.fromEntries(Object.entries(profile||{}).filter(([,value])=>value!==null&&value!==undefined));
  const account = {...meta,...profileMeta};
  const displayName = account.full_name||'Professional';
  const initials = displayName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const plan = account.plan||'growth';
  const currentPlan = planDetails[plan]||planDetails.growth;
  const activeBillingInterval = normalizeBillingInterval(account.billing_interval||account.billing);
  const currentSubscriptionId = String(account.razorpay_subscription_id || '').trim();
  const subscriptionStatus = normalizeSubscriptionStatus(account.subscription_status);
  const cancelAtCycleEnd = !!account.subscription_cancel_at_cycle_end;
  const pendingPlan = account.subscription_pending_plan;
  const pendingInterval = normalizeBillingInterval(account.subscription_pending_interval);
  const hasPaidAccess = hasLiveBilling(currentSubscriptionId, subscriptionStatus);
  const hasBillingSubscription = hasPaidAccess;
  const pendingPlanDetails = pendingPlan ? planDetails[pendingPlan] : null;
  const newEnquiries = enquiries.filter(e=>e.status==='new').length;

  if(!hasPaidAccess) return(
    <div style={{minHeight:'100vh',background:'#F5F0EB',padding:'40px 20px'}}>
      <div style={{maxWidth:980,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,marginBottom:28}}>
          <div style={{fontFamily:'var(--fd)',fontSize:'1.6rem',fontWeight:700,color:'var(--t)',cursor:'pointer'}} onClick={()=>router.push('/')}>
            Home<span style={{color:'var(--b)'}}>izz</span>
          </div>
          <button onClick={signOut} style={{padding:'10px 16px',border:'1.5px solid var(--borderl)',borderRadius:10,background:'#fff',color:'var(--tm)',fontWeight:700,cursor:'pointer',fontSize:'.85rem'}}>
            Sign Out
          </button>
        </div>

        <div style={{background:'#fff',borderRadius:18,padding:'30px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)',marginBottom:22}}>
          <div style={{fontSize:'.72rem',fontWeight:800,letterSpacing:'1.2px',textTransform:'uppercase',color:'var(--t)',marginBottom:10}}>Billing required</div>
          <h1 style={{fontFamily:'var(--fd)',color:'var(--b)',fontSize:'2rem',marginBottom:8}}>Complete billing to open your professional dashboard</h1>
          <p style={{color:'var(--tm)',fontSize:'.95rem',lineHeight:1.7,maxWidth:720}}>
            Your professional profile is saved, but listings, enquiries, and dashboard tools unlock only after a Razorpay subscription is active.
          </p>
          {billingError&&<div style={{background:'#FEF2F2',border:'1px solid #FECACA',color:'#DC2626',borderRadius:10,padding:'12px 16px',marginTop:18,fontSize:'.85rem',fontWeight:600}}>{billingError}</div>}
          {billingMessage&&<div style={{background:'#ECFDF5',border:'1px solid #A7F3D0',color:'#065F46',borderRadius:10,padding:'12px 16px',marginTop:18,fontSize:'.85rem',fontWeight:600}}>{billingMessage}</div>}
        </div>

        <div style={{display:'flex',justifyContent:'center',marginBottom:22}}>
          <div style={{display:'inline-flex',background:'#fff',border:'1.5px solid var(--borderl)',borderRadius:50,padding:4,gap:4}}>
            <button onClick={()=>setBillingInterval('monthly')} style={{border:'none',borderRadius:50,padding:'8px 18px',fontWeight:700,cursor:'pointer',background:billingInterval==='monthly'?'var(--t)':'transparent',color:billingInterval==='monthly'?'#fff':'var(--tlt)'}}>Monthly</button>
            <button onClick={()=>setBillingInterval('annual')} style={{border:'none',borderRadius:50,padding:'8px 18px',fontWeight:700,cursor:'pointer',background:billingInterval==='annual'?'var(--t)':'transparent',color:billingInterval==='annual'?'#fff':'var(--tlt)'}}>Annual</button>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {PLANS.map(p=>{
            const price = billingInterval==='annual' ? p.annualMonthly : p.monthly;
            const isCurrentPlan = plan===p.id;
            return(
              <div key={p.id} style={{background:'#fff',borderRadius:16,padding:'24px',border:`2px solid ${isCurrentPlan?p.color:'var(--borderl)'}`,position:'relative',boxShadow:'var(--sh)'}}>
                {p.popular&&<div style={{position:'absolute',top:-11,left:'50%',transform:'translateX(-50%)',background:p.color,color:'#fff',fontSize:'.68rem',fontWeight:700,padding:'3px 12px',borderRadius:50}}>MOST POPULAR</div>}
                <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:4}}>{p.name}</h3>
                <div style={{fontFamily:'var(--fd)',fontSize:'2rem',fontWeight:700,color:p.color}}>Rs {price.toLocaleString('en-IN')}<span style={{fontSize:'.9rem',fontWeight:400,color:'var(--tlt)'}}>/mo</span></div>
                <div style={{fontSize:'.75rem',color:'var(--sage)',marginBottom:16,fontWeight:600}}>
                  {billingInterval==='annual' ? `Rs ${p.annual.toLocaleString('en-IN')}/yr - billed yearly` : `Rs ${p.monthly.toLocaleString('en-IN')}/mo - billed monthly`}
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:20,paddingTop:14,borderTop:'1px solid var(--borderl)'}}>
                  {p.features.map((f,i)=>(
                    <div key={i} style={{fontSize:'.78rem',color:'var(--tm)',display:'flex',alignItems:'flex-start',gap:6,lineHeight:1.4}}>
                      <span style={{color:p.color,fontWeight:700,flexShrink:0}}>✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={()=>startOrChangeSubscription(p.id)} disabled={!!billingBusy} style={{width:'100%',padding:'11px',border:`2px solid ${p.color}`,borderRadius:10,background:isCurrentPlan?p.color:'transparent',color:isCurrentPlan?'#fff':p.color,fontWeight:700,cursor:billingBusy?'not-allowed':'pointer',fontSize:'.85rem',opacity:billingBusy ? .85 : 1}}>
                  {billingBusy===p.id?'Opening billing...':`Subscribe to ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return(
    <div style={{display:'flex',minHeight:'100vh',background:'#F5F0EB'}}>

      {/* Sidebar */}
      <aside style={{width:260,minHeight:'100vh',background:'var(--b)',position:'fixed',left:0,top:0,bottom:0,zIndex:500,display:'flex',flexDirection:'column'}}>
        <div style={{padding:'22px 24px 18px',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          <div style={{fontFamily:'var(--fd)',fontSize:'1.5rem',fontWeight:700,color:'var(--t)',cursor:'pointer'}} onClick={()=>router.push('/')}>
            Home<span style={{color:'var(--sandl)'}}>izz</span>
          </div>
          <div style={{fontSize:'.65rem',color:'rgba(255,255,255,.25)',marginTop:2,letterSpacing:'.5px'}}>PROFESSIONAL DASHBOARD</div>
        </div>

        <div style={{padding:'16px 20px',borderBottom:'1px solid rgba(255,255,255,.07)',display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:42,height:42,borderRadius:'50%',background:'linear-gradient(135deg,var(--t),var(--bm))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#fff',fontSize:'.9rem',flexShrink:0}}>{initials}</div>
          <div style={{overflow:'hidden',flex:1}}>
            <div style={{color:'#fff',fontWeight:600,fontSize:'.85rem',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{displayName}</div>
            <div style={{fontSize:'.68rem',color:'rgba(255,255,255,.35)',marginTop:1}}>{meta.pro_type||'Professional'}</div>
          </div>
        </div>

        <nav style={{padding:'8px 0',flex:1,overflowY:'auto'}}>
          <div style={{fontSize:'.58rem',fontWeight:800,letterSpacing:'1.5px',textTransform:'uppercase',color:'rgba(255,255,255,.18)',padding:'14px 24px 6px'}}>MENU</div>
          {NAV.map(n=>(
            <div key={n.id} onClick={()=>setTab(n.id)} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 24px',cursor:'pointer',color:tab===n.id?'#fff':'rgba(255,255,255,.45)',background:tab===n.id?'rgba(196,98,45,.12)':'transparent',borderLeft:`3px solid ${tab===n.id?'var(--t)':'transparent'}`,fontSize:'.84rem',fontWeight:500,transition:'all .2s',position:'relative'}}>
              <span style={{fontSize:'1rem'}}>{n.icon}</span>
              {n.label}
              {n.id==='enquiries'&&newEnquiries>0&&(
                <span style={{position:'absolute',right:16,background:'var(--t)',color:'#fff',fontSize:'.65rem',fontWeight:700,padding:'2px 7px',borderRadius:50}}>{newEnquiries}</span>
              )}
            </div>
          ))}
        </nav>

        <div style={{padding:'16px 24px',borderTop:'1px solid rgba(255,255,255,.07)',display:'flex',flexDirection:'column',gap:10}}>
          <div onClick={()=>router.push('/')} style={{display:'flex',alignItems:'center',gap:10,color:'rgba(255,255,255,.35)',cursor:'pointer',fontSize:'.82rem'}}>
            <span>🌐</span> View Website
          </div>
          <div onClick={signOut} style={{display:'flex',alignItems:'center',gap:10,color:'rgba(255,255,255,.35)',cursor:'pointer',fontSize:'.82rem'}}>
            <span>🚪</span> Sign Out
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{marginLeft:260,flex:1,padding:'32px 36px',minHeight:'100vh'}}>
        {/* Mobile tab bar (visible only on small screens) */}
        <div className="h-mtab-bar">
          {NAV.map(n=>(
            <div key={n.id} className={`h-mtab${tab===n.id?' on':''}`} onClick={()=>setTab(n.id)}>
              <span>{n.icon}</span>
              {n.label}
              {n.id==='enquiries'&&newEnquiries>0&&(
                <span className="h-mtab-bdg">{newEnquiries}</span>
              )}
            </div>
          ))}
          <div className="h-mtab" onClick={signOut}>
            <span>🚪</span> Sign Out
          </div>
        </div>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:32}}>
          <div>
            <h1 style={{fontFamily:'var(--fd)',fontSize:'1.8rem',color:'var(--b)',marginBottom:4}}>
              {tab==='overview'&&`Good day, ${displayName.split(' ')[0]}! 👋`}
              {tab==='listings'&&'My Listings'}
              {tab==='enquiries'&&'Enquiries'}
              {tab==='profile'&&'My Profile'}
              {tab==='subscription'&&'Subscription'}
            </h1>
            <p style={{color:'var(--tlt)',fontSize:'.85rem'}}>
              {tab==='overview'&&"Here's your dashboard overview"}
              {tab==='listings'&&`${listings.length} of ${currentPlan.listings} listings used`}
              {tab==='enquiries'&&`${enquiries.length} total · ${newEnquiries} new`}
              {tab==='profile'&&'Manage your professional profile'}
              {tab==='subscription'&&'Manage your plan and billing'}
            </p>
          </div>
          {tab==='listings'&&(
            <button onClick={()=>router.push('/pro-dashboard/add-listing')} style={{padding:'11px 22px',background:'var(--t)',color:'#fff',border:'none',borderRadius:50,fontWeight:700,cursor:'pointer',fontSize:'.88rem',boxShadow:'0 4px 14px rgba(196,98,45,.3)',display:'flex',alignItems:'center',gap:8}}>
              + Add Listing
            </button>
          )}
        </div>

        {/* OVERVIEW */}
        {tab==='overview'&&(
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
              {[
                {label:'Total Listings',value:listings.length,icon:'🖼️',color:'#C4622D',sub:`of ${currentPlan.listings} allowed`},
                {label:'New Enquiries',value:newEnquiries,icon:'💬',color:'#6B7F5E',sub:'unread'},
                {label:'Total Enquiries',value:enquiries.length,icon:'📨',color:'#B8860B',sub:'all time'},
                {label:'Billing Status',value:subscriptionStatus.replaceAll('_',' '),icon:'💳',color:'#2D7D6B',sub:activeBillingInterval},
              ].map(stat=>(
                <div key={stat.label} style={{background:'#fff',borderRadius:16,padding:'20px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                    <span style={{fontSize:'1.4rem'}}>{stat.icon}</span>
                    <span style={{fontSize:'.68rem',color:'var(--tlt)',background:'var(--c)',padding:'3px 8px',borderRadius:50}}>{stat.sub}</span>
                  </div>
                  <div style={{fontFamily:'var(--fd)',fontSize:'2.2rem',fontWeight:700,color:stat.color,lineHeight:1}}>{stat.value}</div>
                  <div style={{fontSize:'.75rem',color:'var(--tlt)',marginTop:5}}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
              <div style={{background:'#fff',borderRadius:16,padding:'24px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                  <h3 style={{fontFamily:'var(--fd)',color:'var(--b)'}}>Your Plan</h3>
                  <span style={{background:currentPlan.color,color:'#fff',fontSize:'.7rem',fontWeight:700,padding:'4px 12px',borderRadius:50}}>{currentPlan.name}</span>
                </div>
                <div>
                  <div style={{fontFamily:'var(--fd)',fontSize:'2rem',fontWeight:700,color:currentPlan.color}}>{currentPlan.price}</div>
                  <div style={{color:'var(--tlt)',fontSize:'.82rem',marginTop:4}}>{hasBillingSubscription?'Active subscription':'Billing not connected'}</div>
                </div>
                <button onClick={()=>setTab('subscription')} style={{marginTop:16,width:'100%',padding:'10px',border:`1.5px solid ${currentPlan.color}`,borderRadius:10,background:'transparent',color:currentPlan.color,fontWeight:600,cursor:'pointer',fontSize:'.85rem'}}>
                  Manage Plan →
                </button>
              </div>

              <div style={{background:'#fff',borderRadius:16,padding:'24px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
                <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:16}}>Quick Actions</h3>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {[
                    {icon:'➕',label:'Add a new listing',action:()=>router.push('/pro-dashboard/add-listing')},
                    {icon:'💬',label:'View enquiries',action:()=>setTab('enquiries')},
                    {icon:'👤',label:'Update profile',action:()=>setTab('profile')},
                    {icon:'🌐',label:'View website',action:()=>router.push('/')},
                  ].map(a=>(
                    <div key={a.label} onClick={a.action} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',border:'1.5px solid var(--borderl)',borderRadius:10,cursor:'pointer',background:'var(--c)'}}>
                      <span style={{fontSize:'1.1rem'}}>{a.icon}</span>
                      <span style={{fontSize:'.85rem',fontWeight:500,color:'var(--b)'}}>{a.label}</span>
                      <span style={{marginLeft:'auto',color:'var(--tlt)'}}>→</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {enquiries.length>0&&(
              <div style={{background:'#fff',borderRadius:16,padding:'24px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                  <h3 style={{fontFamily:'var(--fd)',color:'var(--b)'}}>Recent Enquiries</h3>
                  <button onClick={()=>setTab('enquiries')} style={{background:'none',border:'none',color:'var(--t)',fontWeight:600,cursor:'pointer',fontSize:'.85rem'}}>View all →</button>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {enquiries.slice(0,3).map(enq=>(
                    <div key={enq.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 14px',background:'var(--c)',borderRadius:10}}>
                      <div>
                        <div style={{fontWeight:600,color:'var(--b)',fontSize:'.88rem'}}>{enq.homeowner_name}</div>
                        <div style={{fontSize:'.75rem',color:'var(--tlt)'}}>{enq.budget} · {enq.project_type||'Project'}</div>
                      </div>
                      <span style={{background:enq.status==='new'?'#FEF3C7':'#D1FAE5',color:enq.status==='new'?'#92400E':'#065F46',fontSize:'.7rem',fontWeight:700,padding:'4px 10px',borderRadius:50}}>
                        {enq.status==='new'?'New':'Replied'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {listings.length===0&&(
              <div style={{background:'#fff',borderRadius:16,padding:'48px',border:'2px dashed var(--borderl)',textAlign:'center',marginTop:24}}>
                <div style={{fontSize:'3rem',marginBottom:16}}>🖼️</div>
                <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:8}}>No listings yet</h3>
                <p style={{color:'var(--tlt)',fontSize:'.88rem',marginBottom:20}}>Add your first listing to start getting enquiries</p>
                <button onClick={()=>router.push('/pro-dashboard/add-listing')} style={{padding:'12px 28px',background:'var(--t)',color:'#fff',border:'none',borderRadius:50,fontWeight:700,cursor:'pointer',fontSize:'.9rem',boxShadow:'0 4px 14px rgba(196,98,45,.3)'}}>
                  + Add Your First Listing
                </button>
              </div>
            )}
          </div>
        )}

        {/* LISTINGS */}
        {tab==='listings'&&(
          <div>
            {listings.length===0?(
              <div style={{background:'#fff',borderRadius:16,padding:'60px',border:'2px dashed var(--borderl)',textAlign:'center'}}>
                <div style={{fontSize:'3rem',marginBottom:16}}>🖼️</div>
                <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:8}}>No listings yet</h3>
                <p style={{color:'var(--tlt)',fontSize:'.88rem',marginBottom:20}}>You can add up to {currentPlan.listings} listings on your {currentPlan.name} plan</p>
                <button onClick={()=>router.push('/pro-dashboard/add-listing')} style={{padding:'12px 28px',background:'var(--t)',color:'#fff',border:'none',borderRadius:50,fontWeight:700,cursor:'pointer',fontSize:'.9rem'}}>
                  + Add First Listing
                </button>
              </div>
            ):(
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:20}}>
                {listings.map(listing=>(
                  <div key={listing.id} style={{background:'#fff',borderRadius:16,overflow:'hidden',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
                    <div style={{height:180,background:'linear-gradient(135deg,#F5DDD0,#FBF0E8)',position:'relative',overflow:'hidden'}}>
                      {listing.cover_image
                        ?<img src={listing.cover_image} alt={listing.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        :<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.5rem'}}>🏠</div>
                      }
                      <div style={{position:'absolute',top:10,right:10,background:listing.status==='live'?'#D1FAE5':'#FEF3C7',color:listing.status==='live'?'#065F46':'#92400E',fontSize:'.65rem',fontWeight:700,padding:'3px 8px',borderRadius:50}}>
                        {listing.status==='live'?'● Live':'● Draft'}
                      </div>
                    </div>
                    <div style={{padding:'16px'}}>
                      <div style={{fontWeight:700,color:'var(--b)',fontSize:'.9rem',marginBottom:4,display:'-webkit-box',WebkitLineClamp:1,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{listing.title}</div>
                      <div style={{fontSize:'.75rem',color:'var(--tlt)',marginBottom:12}}>📍 {listing.city} · {listing.listing_type}</div>
                      <div style={{display:'flex',gap:8}}>
                        <button onClick={()=>router.push(`/listing/${listing.id}`)} style={{flex:1,padding:'8px',border:'1.5px solid var(--borderl)',borderRadius:8,background:'transparent',color:'var(--tm)',fontSize:'.78rem',fontWeight:600,cursor:'pointer'}}>View</button>
                        <button onClick={()=>deleteListing(listing.id)} style={{flex:1,padding:'8px',border:'1.5px solid #FECACA',borderRadius:8,background:'transparent',color:'#DC2626',fontSize:'.78rem',fontWeight:600,cursor:'pointer'}}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
                {listings.length<currentPlan.listings&&(
                  <div onClick={()=>router.push('/pro-dashboard/add-listing')} style={{background:'#fff',borderRadius:16,border:'2px dashed var(--borderl)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px',cursor:'pointer',minHeight:280}}>
                    <div style={{fontSize:'2.5rem',marginBottom:12}}>➕</div>
                    <div style={{fontWeight:600,color:'var(--t)',fontSize:'.9rem'}}>Add Listing</div>
                    <div style={{fontSize:'.75rem',color:'var(--tlt)',marginTop:4}}>{currentPlan.listings-listings.length} slots remaining</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ENQUIRIES */}
        {tab==='enquiries'&&(
          <div>
            {enquiries.length===0?(
              <div style={{background:'#fff',borderRadius:16,padding:'60px',border:'2px dashed var(--borderl)',textAlign:'center'}}>
                <div style={{fontSize:'3rem',marginBottom:16}}>💬</div>
                <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:8}}>No enquiries yet</h3>
                <p style={{color:'var(--tlt)',fontSize:'.88rem',marginBottom:20}}>Add listings to start receiving enquiries</p>
                <button onClick={()=>setTab('listings')} style={{padding:'12px 28px',background:'var(--t)',color:'#fff',border:'none',borderRadius:50,fontWeight:700,cursor:'pointer',fontSize:'.9rem'}}>
                  Manage Listings →
                </button>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                {enquiries.map(enq=>(
                  <div key={enq.id} style={{background:'#fff',borderRadius:14,padding:'20px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                      <div>
                        <div style={{fontWeight:700,color:'var(--b)',fontSize:'.95rem'}}>{enq.homeowner_name}</div>
                        <div style={{fontSize:'.78rem',color:'var(--tlt)',marginTop:2}}>{enq.homeowner_phone} · {enq.homeowner_email}</div>
                      </div>
                      <span style={{background:enq.status==='new'?'#FEF3C7':'#D1FAE5',color:enq.status==='new'?'#92400E':'#065F46',fontSize:'.72rem',fontWeight:700,padding:'4px 12px',borderRadius:50,flexShrink:0}}>
                        {enq.status==='new'?'New':'Replied'}
                      </span>
                    </div>
                    <div style={{display:'flex',gap:10,marginBottom:12,flexWrap:'wrap'}}>
                      {enq.budget&&<span style={{fontSize:'.75rem',background:'var(--c)',color:'var(--tm)',padding:'4px 10px',borderRadius:50,border:'1px solid var(--borderl)'}}>💰 {enq.budget}</span>}
                      {enq.project_type&&<span style={{fontSize:'.75rem',background:'var(--c)',color:'var(--tm)',padding:'4px 10px',borderRadius:50,border:'1px solid var(--borderl)'}}>🏠 {enq.project_type}</span>}
                      {enq.timeline&&<span style={{fontSize:'.75rem',background:'var(--c)',color:'var(--tm)',padding:'4px 10px',borderRadius:50,border:'1px solid var(--borderl)'}}>📅 {enq.timeline}</span>}
                    </div>
                    <div style={{background:'var(--c)',padding:'12px 14px',borderRadius:10,fontSize:'.85rem',color:'var(--tm)',lineHeight:1.7,marginBottom:12}}>{enq.message}</div>
                    <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                      {enq.homeowner_phone && (
                        <a
                          href={waLink(enq)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={()=>markReplied(enq.id)}
                          style={{padding:'9px 16px',background:'#25D366',color:'#fff',borderRadius:8,fontSize:'.8rem',fontWeight:600,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:6}}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          WhatsApp
                        </a>
                      )}
                      <a
                        href={emailLink(enq)}
                        onClick={()=>markReplied(enq.id)}
                        style={{padding:'9px 16px',background:'var(--t)',color:'#fff',borderRadius:8,fontSize:'.8rem',fontWeight:600,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:6}}
                      >
                        ✉️ Reply via Email
                      </a>
                      {enq.homeowner_phone && (
                        <a
                          href={`tel:${enq.homeowner_phone}`}
                          onClick={()=>markReplied(enq.id)}
                          style={{padding:'9px 16px',border:'1.5px solid var(--borderl)',color:'var(--tm)',borderRadius:8,fontSize:'.8rem',fontWeight:600,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:6,background:'#fff'}}
                        >
                          📞 Call
                        </a>
                      )}
                      <span style={{fontSize:'.72rem',color:'var(--tlt)',marginLeft:'auto'}}>{new Date(enq.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE */}
        {tab==='profile'&&(
          <div style={{background:'#fff',borderRadius:16,padding:'32px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
            <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:28,paddingBottom:24,borderBottom:'1px solid var(--borderl)'}}>
              <div style={{width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,var(--t),var(--bm))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#fff',fontSize:'1.5rem'}}>{initials}</div>
              <div>
                <h2 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:4}}>{displayName}</h2>
                <div style={{color:'var(--tlt)',fontSize:'.85rem'}}>{meta.pro_type||'Professional'} · {meta.primary_city||'City not set'}</div>
                <div style={{display:'inline-flex',alignItems:'center',gap:6,background:`${currentPlan.color}20`,color:currentPlan.color,fontSize:'.72rem',fontWeight:700,padding:'3px 10px',borderRadius:50,marginTop:6}}>
                  {currentPlan.name} Plan
                </div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              {[
                {label:'Email',value:user?.email},
                {label:'Phone',value:meta.phone},
                {label:'Profile Type',value:meta.profile_type==='individual'?'👤 Individual':'🏢 Firm'},
                {label:'Experience',value:meta.experience},
                {label:'Primary City',value:meta.primary_city},
                {label:'Min Budget',value:meta.min_budget},
                {label:'Instagram',value:meta.instagram||'Not set'},
                {label:'Website',value:meta.website||'Not set'},
              ].map(f=>(
                <div key={f.label} style={{padding:'14px 16px',background:'var(--c)',borderRadius:10}}>
                  <div style={{fontSize:'.7rem',fontWeight:700,color:'var(--tlt)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:4}}>{f.label}</div>
                  <div style={{fontSize:'.9rem',color:'var(--b)',fontWeight:500}}>{f.value||'Not set'}</div>
                </div>
              ))}
            </div>
            {meta.bio&&(
              <div style={{marginTop:16,padding:'16px',background:'var(--c)',borderRadius:10}}>
                <div style={{fontSize:'.7rem',fontWeight:700,color:'var(--tlt)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:6}}>Bio</div>
                <div style={{fontSize:'.9rem',color:'var(--tm)',lineHeight:1.75}}>{meta.bio}</div>
              </div>
            )}
            {meta.styles&&meta.styles.length>0&&(
              <div style={{marginTop:16}}>
                <div style={{fontSize:'.7rem',fontWeight:700,color:'var(--tlt)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:10}}>Design Styles</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {meta.styles.map(s=><span key={s} style={{padding:'5px 14px',background:'var(--tpp)',color:'var(--t)',borderRadius:50,fontSize:'.8rem',fontWeight:500}}>{s}</span>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBSCRIPTION */}
        {tab==='subscription'&&(
          <div>
            <div style={{background:'#fff',borderRadius:16,padding:'22px 24px',border:'1.5px solid var(--borderl)',marginBottom:18,display:'flex',gap:18,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap'}}>
              <div>
                <div style={{fontSize:'.72rem',fontWeight:800,letterSpacing:'.8px',textTransform:'uppercase',color:'var(--tlt)',marginBottom:8}}>Billing status</div>
                <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                  <span style={{background:currentPlan.color,color:'#fff',fontSize:'.75rem',fontWeight:800,padding:'5px 12px',borderRadius:50}}>{currentPlan.name}</span>
                  <span style={{color:'var(--tm)',fontSize:'.86rem',fontWeight:600,textTransform:'capitalize'}}>{subscriptionStatus.replaceAll('_',' ')}</span>
                  <span style={{color:'var(--tlt)',fontSize:'.82rem'}}>Billing: {activeBillingInterval}</span>
                  {account.subscription_current_end&&<span style={{color:'var(--tlt)',fontSize:'.82rem'}}>Renews: {formatBillingDate(account.subscription_current_end)}</span>}
                </div>
                {pendingPlanDetails&&(
                  <div style={{marginTop:8,color:'#92400E',fontSize:'.82rem',fontWeight:600}}>Pending switch to {pendingPlanDetails.name} ({pendingInterval}) at cycle end.</div>
                )}
                {cancelAtCycleEnd&&(
                  <div style={{marginTop:8,color:'#92400E',fontSize:'.82rem',fontWeight:600}}>Cancellation scheduled. Listings stay active until the current period ends.</div>
                )}
              </div>
              {hasBillingSubscription&&!cancelAtCycleEnd&&(
                <button onClick={cancelSubscription} disabled={!!billingBusy} style={{padding:'10px 16px',border:'1.5px solid #FECACA',borderRadius:10,background:'#fff',color:'#DC2626',fontWeight:700,cursor:billingBusy?'not-allowed':'pointer',fontSize:'.82rem'}}>
                  {billingBusy==='cancel'?'Cancelling...':'Cancel at period end'}
                </button>
              )}
            </div>

            {billingError&&<div style={{background:'#FEF2F2',border:'1px solid #FECACA',color:'#DC2626',borderRadius:10,padding:'12px 16px',marginBottom:18,fontSize:'.85rem',fontWeight:600}}>{billingError}</div>}
            {billingMessage&&<div style={{background:'#ECFDF5',border:'1px solid #A7F3D0',color:'#065F46',borderRadius:10,padding:'12px 16px',marginBottom:18,fontSize:'.85rem',fontWeight:600}}>{billingMessage}</div>}

            <div style={{display:'flex',justifyContent:'center',marginBottom:22}}>
              <div style={{display:'inline-flex',background:'#fff',border:'1.5px solid var(--borderl)',borderRadius:50,padding:4,gap:4}}>
                <button onClick={()=>setBillingInterval('monthly')} style={{border:'none',borderRadius:50,padding:'8px 18px',fontWeight:700,cursor:'pointer',background:billingInterval==='monthly'?'var(--t)':'transparent',color:billingInterval==='monthly'?'#fff':'var(--tlt)'}}>Monthly</button>
                <button onClick={()=>setBillingInterval('annual')} style={{border:'none',borderRadius:50,padding:'8px 18px',fontWeight:700,cursor:'pointer',background:billingInterval==='annual'?'var(--t)':'transparent',color:billingInterval==='annual'?'#fff':'var(--tlt)'}}>Annual</button>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:24}}>
              {PLANS.map(p=>{
                const price = billingInterval==='annual' ? p.annualMonthly : p.monthly;
                const isCurrentBilling = hasBillingSubscription && plan===p.id && activeBillingInterval===billingInterval && !pendingPlan && !cancelAtCycleEnd;
                const isCurrentPlan = plan===p.id;
                const disabled = isCurrentBilling || !!billingBusy;
                const label = billingBusy===p.id
                  ? 'Working...'
                  : isCurrentBilling
                    ? 'Current Plan'
                    : hasBillingSubscription
                      ? `Switch to ${p.name}`
                      : `Subscribe to ${p.name}`;
                return(
                  <div key={p.id} style={{background:'#fff',borderRadius:16,padding:'24px',border:`2px solid ${isCurrentPlan?p.color:'var(--borderl)'}`,position:'relative'}}>
                    {p.popular&&<div style={{position:'absolute',top:-11,left:'50%',transform:'translateX(-50%)',background:p.color,color:'#fff',fontSize:'.68rem',fontWeight:700,padding:'3px 12px',borderRadius:50}}>MOST POPULAR</div>}
                    {isCurrentPlan&&<div style={{position:'absolute',top:14,right:14,background:p.color,color:'#fff',fontSize:'.65rem',fontWeight:700,padding:'2px 8px',borderRadius:50}}>YOUR PLAN</div>}
                    {pendingPlan===p.id&&<div style={{position:'absolute',top:40,right:14,background:'#FEF3C7',color:'#92400E',fontSize:'.65rem',fontWeight:700,padding:'2px 8px',borderRadius:50}}>PENDING</div>}
                    <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:4}}>{p.name}</h3>
                    <div style={{fontFamily:'var(--fd)',fontSize:'2rem',fontWeight:700,color:p.color}}>Rs {price.toLocaleString('en-IN')}<span style={{fontSize:'.9rem',fontWeight:400,color:'var(--tlt)'}}>/mo</span></div>
                    <div style={{fontSize:'.75rem',color:'var(--sage)',marginBottom:16,fontWeight:600}}>
                      {billingInterval==='annual' ? `Rs ${p.annual.toLocaleString('en-IN')}/yr - billed yearly` : `Rs ${p.monthly.toLocaleString('en-IN')}/mo - billed monthly`}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:20,paddingTop:14,borderTop:'1px solid var(--borderl)'}}>
                      {p.features.map((f,i)=>(
                        <div key={i} style={{fontSize:'.78rem',color:'var(--tm)',display:'flex',alignItems:'flex-start',gap:6,lineHeight:1.4}}>
                          <span style={{color:p.color,fontWeight:700,flexShrink:0}}>✓</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={()=>startOrChangeSubscription(p.id)} disabled={disabled} style={{width:'100%',padding:'11px',border:`2px solid ${p.color}`,borderRadius:10,background:isCurrentBilling?p.color:'transparent',color:isCurrentBilling?'#fff':p.color,fontWeight:700,cursor:disabled?'not-allowed':'pointer',fontSize:'.85rem',opacity:disabled ? .85 : 1}}>
                      {label}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
