'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export const dynamic = 'force-dynamic';

const NAV = [
  { id: 'overview', icon: '📊', label: 'Overview' },
  { id: 'listings', icon: '🖼️', label: 'My Listings' },
  { id: 'enquiries', icon: '💬', label: 'Enquiries' },
  { id: 'profile', icon: '👤', label: 'My Profile' },
  { id: 'subscription', icon: '💳', label: 'Subscription' },
];

const planDetails = {
  starter: { name:'Starter', listings:3, color:'#6B7F5E', price:'₹499/mo' },
  growth: { name:'Growth', listings:10, color:'#C4622D', price:'₹1,499/mo' },
  pro: { name:'Pro', listings:25, color:'#B8860B', price:'₹3,999/mo' },
};

export default function ProDashboard() {
  const sb = createClient();
  const router = useRouter();
  const [tab, setTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth'); return; }
      if (data.user.user_metadata?.role !== 'professional') { router.push('/'); return; }
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  async function signOut() {
    await sb.auth.signOut();
    router.push('/');
  }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--c)'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:'var(--fd)',fontSize:'1.5rem',color:'var(--t)',marginBottom:8}}>Homeizz</div>
        <div style={{color:'var(--tlt)',fontSize:'.9rem'}}>Loading your dashboard...</div>
      </div>
    </div>
  );

  const meta = user?.user_metadata || {};
  const displayName = meta.full_name || 'Professional';
  const initials = displayName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const plan = meta.plan || 'growth';
  const trialEnd = meta.trial_end ? new Date(meta.trial_end) : new Date(Date.now()+90*24*60*60*1000);
  const daysLeft = Math.max(0, Math.ceil((trialEnd-new Date())/(1000*60*60*24)));
  const isTrialActive = daysLeft > 0;
  const currentPlan = planDetails[plan] || planDetails.growth;

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'#F5F0EB'}}>

      {/* Sidebar */}
      <aside style={{width:252,minHeight:'100vh',background:'var(--b)',position:'fixed',left:0,top:0,bottom:0,zIndex:500,display:'flex',flexDirection:'column'}}>
        <div style={{padding:'20px 22px 16px',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
          <div style={{fontFamily:'var(--fd)',fontSize:'1.5rem',fontWeight:700,color:'var(--t)',cursor:'pointer'}} onClick={()=>router.push('/')}>
            Home<span style={{color:'var(--sandl)'}}>izz</span>
          </div>
          <div style={{fontSize:'.68rem',color:'rgba(255,255,255,.3)',marginTop:2}}>Professional Dashboard</div>
        </div>

        <div style={{padding:'16px 22px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,var(--t),var(--bm))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#fff',fontSize:'.9rem',flexShrink:0}}>{initials}</div>
          <div style={{overflow:'hidden'}}>
            <div style={{color:'#fff',fontWeight:600,fontSize:'.85rem',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{displayName}</div>
            <div style={{fontSize:'.7rem',color:'rgba(255,255,255,.4)'}}>{meta.pro_type||'Professional'}</div>
          </div>
        </div>

        {isTrialActive&&(
          <div style={{margin:'12px 14px',background:'rgba(107,127,94,.25)',border:'1px solid rgba(107,127,94,.4)',borderRadius:10,padding:'10px 14px'}}>
            <div style={{color:'#A8C89A',fontSize:'.72rem',fontWeight:700,marginBottom:2}}>🎉 FREE TRIAL ACTIVE</div>
            <div style={{color:'rgba(255,255,255,.7)',fontSize:'.78rem'}}>{daysLeft} days remaining</div>
            <div style={{height:4,background:'rgba(255,255,255,.1)',borderRadius:2,marginTop:8}}>
              <div style={{height:'100%',background:'#6B7F5E',borderRadius:2,width:`${(daysLeft/90)*100}%`}}/>
            </div>
          </div>
        )}

        <nav style={{padding:'8px 0',flex:1}}>
          <div style={{fontSize:'.6rem',fontWeight:800,letterSpacing:'1.4px',textTransform:'uppercase',color:'rgba(255,255,255,.2)',padding:'13px 22px 5px'}}>Menu</div>
          {NAV.map(n=>(
            <div key={n.id} onClick={()=>setTab(n.id)} style={{display:'flex',alignItems:'center',gap:11,padding:'11px 22px',cursor:'pointer',color:tab===n.id?'#fff':'rgba(255,255,255,.48)',background:tab===n.id?'rgba(196,98,45,.15)':'transparent',borderLeft:`3px solid ${tab===n.id?'var(--t)':'transparent'}`,fontSize:'.84rem',fontWeight:500,transition:'all .2s'}}>
              <span style={{fontSize:'1rem'}}>{n.icon}</span>{n.label}
            </div>
          ))}
        </nav>

        <div style={{padding:'16px 22px',borderTop:'1px solid rgba(255,255,255,.08)'}}>
          <div onClick={signOut} style={{display:'flex',alignItems:'center',gap:10,color:'rgba(255,255,255,.4)',cursor:'pointer',fontSize:'.84rem',fontWeight:500}}>
            <span>🚪</span> Sign Out
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{marginLeft:252,flex:1,padding:'32px 36px',minHeight:'100vh'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:32}}>
          <div>
            <h1 style={{fontFamily:'var(--fd)',fontSize:'1.8rem',color:'var(--b)',marginBottom:4}}>
              {tab==='overview'&&`Welcome back, ${displayName.split(' ')[0]}! 👋`}
              {tab==='listings'&&'My Listings'}
              {tab==='enquiries'&&'Enquiries'}
              {tab==='profile'&&'My Profile'}
              {tab==='subscription'&&'Subscription'}
            </h1>
            <p style={{color:'var(--tlt)',fontSize:'.85rem'}}>
              {tab==='overview'&&"Here's what's happening with your profile"}
              {tab==='listings'&&'Manage your listed projects and portfolio'}
              {tab==='enquiries'&&'Homeowners who reached out to you'}
              {tab==='profile'&&'Update your professional information'}
              {tab==='subscription'&&'Manage your plan and billing'}
            </p>
          </div>
          {tab==='listings'&&(
            <button onClick={()=>router.push('/pro-dashboard/add-listing')} style={{padding:'11px 22px',background:'var(--t)',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer',fontSize:'.88rem',boxShadow:'0 4px 14px rgba(196,98,45,.3)'}}>
              + Add Listing
            </button>
          )}
        </div>

        {/* OVERVIEW */}
        {tab==='overview'&&(
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:28}}>
              {[
                {label:'Total Listings',value:'0',icon:'🖼️',color:'#C4622D',sub:`of ${currentPlan.listings} allowed`},
                {label:'Enquiries Received',value:'0',icon:'💬',color:'#6B7F5E',sub:'this month'},
                {label:'Profile Views',value:'0',icon:'👁️',color:'#B8860B',sub:'this month'},
                {label:'WhatsApp Clicks',value:'0',icon:'📱',color:'#2D7D6B',sub:'this month'},
              ].map(stat=>(
                <div key={stat.label} style={{background:'#fff',borderRadius:16,padding:'20px 22px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                    <span style={{fontSize:'1.5rem'}}>{stat.icon}</span>
                    <span style={{fontSize:'.7rem',color:'var(--tlt)',background:'var(--c)',padding:'3px 8px',borderRadius:50}}>{stat.sub}</span>
                  </div>
                  <div style={{fontFamily:'var(--fd)',fontSize:'2rem',fontWeight:700,color:stat.color,lineHeight:1}}>{stat.value}</div>
                  <div style={{fontSize:'.78rem',color:'var(--tlt)',marginTop:4}}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:28}}>
              <div style={{background:'#fff',borderRadius:16,padding:'24px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                  <h3 style={{fontFamily:'var(--fd)',color:'var(--b)'}}>Your Plan</h3>
                  <span style={{background:currentPlan.color,color:'#fff',fontSize:'.72rem',fontWeight:700,padding:'4px 12px',borderRadius:50}}>{currentPlan.name}</span>
                </div>
                {isTrialActive?(
                  <div>
                    <div style={{fontSize:'2rem',fontWeight:800,color:'#6B7F5E',fontFamily:'var(--fd)'}}>FREE</div>
                    <div style={{color:'var(--tlt)',fontSize:'.82rem',marginBottom:16}}>Trial ends in {daysLeft} days</div>
                    <div style={{height:6,background:'var(--borderl)',borderRadius:3,marginBottom:8}}>
                      <div style={{height:'100%',background:'#6B7F5E',borderRadius:3,width:`${(daysLeft/90)*100}%`}}/>
                    </div>
                    <div style={{fontSize:'.75rem',color:'var(--tlt)'}}>After trial: {currentPlan.price}</div>
                  </div>
                ):(
                  <div>
                    <div style={{fontSize:'2rem',fontWeight:800,color:currentPlan.color,fontFamily:'var(--fd)'}}>{currentPlan.price}</div>
                    <div style={{color:'var(--tlt)',fontSize:'.82rem',marginTop:4}}>Active subscription</div>
                  </div>
                )}
                <button onClick={()=>setTab('subscription')} style={{marginTop:16,width:'100%',padding:'10px',border:`1.5px solid ${currentPlan.color}`,borderRadius:10,background:'transparent',color:currentPlan.color,fontWeight:600,cursor:'pointer',fontSize:'.85rem'}}>
                  Manage Plan →
                </button>
              </div>

              <div style={{background:'#fff',borderRadius:16,padding:'24px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
                <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:16}}>Quick Actions</h3>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {[
                    {icon:'➕',label:'Add a new listing',action:()=>router.push('/pro-dashboard/add-listing')},
                    {icon:'👤',label:'Update my profile',action:()=>setTab('profile')},
                    {icon:'💬',label:'View enquiries',action:()=>setTab('enquiries')},
                    {icon:'🌐',label:'View my public profile',action:()=>router.push(`/designer/${user?.id}`)},
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

            <div style={{background:'#fff',borderRadius:16,padding:'40px',border:'2px dashed var(--borderl)',textAlign:'center'}}>
              <div style={{fontSize:'3rem',marginBottom:16}}>🖼️</div>
              <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:8}}>No listings yet</h3>
              <p style={{color:'var(--tlt)',fontSize:'.88rem',marginBottom:20,maxWidth:360,margin:'0 auto 20px'}}>Add your first listing to start getting enquiries from homeowners across India</p>
              <button onClick={()=>router.push('/pro-dashboard/add-listing')} style={{padding:'12px 28px',background:'var(--t)',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer',fontSize:'.9rem',boxShadow:'0 4px 14px rgba(196,98,45,.3)'}}>
                + Add Your First Listing
              </button>
            </div>
          </div>
        )}

        {/* LISTINGS */}
        {tab==='listings'&&(
          <div style={{background:'#fff',borderRadius:16,padding:'40px',border:'2px dashed var(--borderl)',textAlign:'center'}}>
            <div style={{fontSize:'3rem',marginBottom:16}}>🖼️</div>
            <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:8}}>No listings yet</h3>
            <p style={{color:'var(--tlt)',fontSize:'.88rem',marginBottom:20}}>You can add up to {currentPlan.listings} listings on your {currentPlan.name} plan</p>
            <button onClick={()=>router.push('/pro-dashboard/add-listing')} style={{padding:'12px 28px',background:'var(--t)',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer',fontSize:'.9rem'}}>
              + Add Your First Listing
            </button>
          </div>
        )}

        {/* ENQUIRIES */}
        {tab==='enquiries'&&(
          <div style={{background:'#fff',borderRadius:16,padding:'40px',border:'2px dashed var(--borderl)',textAlign:'center'}}>
            <div style={{fontSize:'3rem',marginBottom:16}}>💬</div>
            <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:8}}>No enquiries yet</h3>
            <p style={{color:'var(--tlt)',fontSize:'.88rem',marginBottom:20}}>Once homeowners send you enquiries, they will appear here</p>
            <button onClick={()=>setTab('listings')} style={{padding:'12px 28px',background:'var(--t)',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer',fontSize:'.9rem'}}>
              Add listings to get enquiries →
            </button>
          </div>
        )}

        {/* PROFILE */}
        {tab==='profile'&&(
          <div style={{background:'#fff',borderRadius:16,padding:'32px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
            <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:32,paddingBottom:24,borderBottom:'1px solid var(--borderl)'}}>
              <div style={{width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,var(--t),var(--bm))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#fff',fontSize:'1.5rem'}}>{initials}</div>
              <div>
                <h2 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:4}}>{displayName}</h2>
                <div style={{color:'var(--tlt)',fontSize:'.85rem'}}>{meta.pro_type||'Professional'} · {meta.primary_city||'City not set'}</div>
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
                  <div style={{fontSize:'.72rem',fontWeight:700,color:'var(--tlt)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:4}}>{f.label}</div>
                  <div style={{fontSize:'.9rem',color:'var(--b)',fontWeight:500}}>{f.value||'Not set'}</div>
                </div>
              ))}
            </div>
            {meta.bio&&<div style={{marginTop:20,padding:'16px',background:'var(--c)',borderRadius:10}}>
              <div style={{fontSize:'.72rem',fontWeight:700,color:'var(--tlt)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:6}}>Bio</div>
              <div style={{fontSize:'.9rem',color:'var(--tm)',lineHeight:1.75}}>{meta.bio}</div>
            </div>}
            {meta.styles&&meta.styles.length>0&&<div style={{marginTop:20}}>
              <div style={{fontSize:'.72rem',fontWeight:700,color:'var(--tlt)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:10}}>Design Styles</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {meta.styles.map(s=><span key={s} style={{padding:'5px 14px',background:'var(--tpp)',color:'var(--t)',borderRadius:50,fontSize:'.8rem',fontWeight:500}}>{s}</span>)}
              </div>
            </div>}
          </div>
        )}

        {/* SUBSCRIPTION */}
        {tab==='subscription'&&(
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:24}}>
              {[
                {id:'starter',name:'Starter',price:'₹499',annual:'₹4,990',listings:3,visibility:'60 days',color:'#6B7F5E'},
                {id:'growth',name:'Growth',price:'₹1,499',annual:'₹14,990',listings:10,visibility:'150 days',color:'#C4622D',popular:true},
                {id:'pro',name:'Pro',price:'₹3,999',annual:'₹39,990',listings:25,visibility:'6 months',color:'#B8860B'},
              ].map(p=>(
                <div key={p.id} style={{background:'#fff',borderRadius:16,padding:'24px',border:`2px solid ${plan===p.id?p.color:'var(--borderl)'}`,position:'relative'}}>
                  {p.popular&&<div style={{position:'absolute',top:-11,left:'50%',transform:'translateX(-50%)',background:p.color,color:'#fff',fontSize:'.68rem',fontWeight:700,padding:'3px 12px',borderRadius:50}}>MOST POPULAR</div>}
                  {plan===p.id&&<div style={{position:'absolute',top:14,right:14,background:p.color,color:'#fff',fontSize:'.65rem',fontWeight:700,padding:'2px 8px',borderRadius:50}}>YOUR PLAN</div>}
                  <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:4}}>{p.name}</h3>
                  <div style={{fontFamily:'var(--fd)',fontSize:'2rem',fontWeight:700,color:p.color}}>{p.price}<span style={{fontSize:'.9rem',fontWeight:400,color:'var(--tlt)'}}>/mo</span></div>
                  <div style={{fontSize:'.75rem',color:'var(--tlt)',marginBottom:16}}>{p.annual}/year (save 2 months)</div>
                  <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
                    <div style={{fontSize:'.82rem',color:'var(--tm)'}}>✓ {p.listings} listings</div>
                    <div style={{fontSize:'.82rem',color:'var(--tm)'}}>✓ Visible for {p.visibility}</div>
                    <div style={{fontSize:'.82rem',color:'var(--tm)'}}>✓ WhatsApp enquiries</div>
                    <div style={{fontSize:'.82rem',color:'var(--tm)'}}>✓ Email notifications</div>
                  </div>
                  <button style={{width:'100%',padding:'11px',border:`2px solid ${p.color}`,borderRadius:10,background:plan===p.id?p.color:'transparent',color:plan===p.id?'#fff':p.color,fontWeight:700,cursor:'pointer',fontSize:'.85rem'}}>
                    {plan===p.id?(isTrialActive?'Current Plan (Trial)':'Current Plan'):'Switch to this plan'}
                  </button>
                </div>
              ))}
            </div>
            {isTrialActive&&(
              <div style={{background:'#fff',borderRadius:16,padding:'24px',border:'1.5px solid var(--borderl)',display:'flex',alignItems:'center',gap:20}}>
                <span style={{fontSize:'2.5rem'}}>🎉</span>
                <div>
                  <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:4}}>You are on a Free Trial!</h3>
                  <p style={{color:'var(--tlt)',fontSize:'.85rem'}}>Your trial ends in <strong style={{color:'var(--t)'}}>{daysLeft} days</strong>. After that, your {currentPlan.name} plan at {currentPlan.price} will start automatically.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}