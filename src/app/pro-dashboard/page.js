'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export const dynamic = 'force-dynamic';

const NAV = [
  {id:'overview',icon:'📊',label:'Overview'},
  {id:'listings',icon:'🖼️',label:'My Listings'},
  {id:'enquiries',icon:'💬',label:'Enquiries'},
  {id:'profile',icon:'👤',label:'My Profile'},
  {id:'subscription',icon:'💳',label:'Subscription'},
];

const planDetails = {
  starter:{name:'Starter',listings:3,color:'#6B7F5E',price:'₹499/mo'},
  growth:{name:'Growth',listings:10,color:'#C4622D',price:'₹1,499/mo'},
  pro:{name:'Pro',listings:25,color:'#B8860B',price:'₹3,999/mo'},
};

export default function ProDashboard(){
  const sb = createClient();
  const router = useRouter();
  const [tab,setTab] = useState('overview');
  const [user,setUser] = useState(null);
  const [listings,setListings] = useState([]);
  const [enquiries,setEnquiries] = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    sb.auth.getUser().then(async({data})=>{
      if(!data.user){router.push('/auth');return;}
      if(data.user.user_metadata?.role!=='professional'){router.push('/');return;}
      setUser(data.user);
      // Fetch listings and enquiries in parallel
      const [listingsRes, enquiriesRes] = await Promise.all([
        sb.from('listings').select('*').eq('owner_id',data.user.id).order('created_at',{ascending:false}),
        sb.from('enquiries').select('*').eq('professional_id',data.user.id).order('created_at',{ascending:false}),
      ]);
      setListings(listingsRes.data||[]);
      setEnquiries(enquiriesRes.data||[]);
      setLoading(false);
    });
  },[]);

  async function signOut(){await sb.auth.signOut();router.push('/');}

  async function deleteListing(id){
    if(!confirm('Delete this listing?')) return;
    await sb.from('listings').delete().eq('id',id);
    setListings(prev=>prev.filter(l=>l.id!==id));
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
  const displayName = meta.full_name||'Professional';
  const initials = displayName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const plan = meta.plan||'growth';
  const trialEnd = meta.trial_end?new Date(meta.trial_end):new Date(Date.now()+90*24*60*60*1000);
  const daysLeft = Math.max(0,Math.ceil((trialEnd-new Date())/(1000*60*60*24)));
  const isTrialActive = daysLeft>0;
  const currentPlan = planDetails[plan]||planDetails.growth;
  const newEnquiries = enquiries.filter(e=>e.status==='new').length;

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

        {isTrialActive&&(
          <div style={{margin:'12px 16px',background:'rgba(107,127,94,.2)',border:'1px solid rgba(107,127,94,.35)',borderRadius:10,padding:'10px 14px'}}>
            <div style={{color:'#A8C89A',fontSize:'.7rem',fontWeight:700,marginBottom:3}}>🎉 FREE TRIAL</div>
            <div style={{color:'rgba(255,255,255,.65)',fontSize:'.78rem'}}>{daysLeft} days remaining</div>
            <div style={{height:3,background:'rgba(255,255,255,.1)',borderRadius:2,marginTop:8}}>
              <div style={{height:'100%',background:'#6B7F5E',borderRadius:2,width:`${(daysLeft/90)*100}%`}}/>
            </div>
          </div>
        )}

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
                {label:'Trial Days Left',value:isTrialActive?daysLeft:'—',icon:'⏳',color:'#2D7D6B',sub:isTrialActive?'days free':'subscription active'},
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
                {isTrialActive?(
                  <div>
                    <div style={{fontFamily:'var(--fd)',fontSize:'2.5rem',fontWeight:700,color:'#6B7F5E',lineHeight:1}}>FREE</div>
                    <div style={{color:'var(--tlt)',fontSize:'.82rem',marginBottom:14,marginTop:4}}>Trial ends in {daysLeft} days</div>
                    <div style={{height:6,background:'var(--borderl)',borderRadius:3,marginBottom:8}}>
                      <div style={{height:'100%',background:'#6B7F5E',borderRadius:3,width:`${(daysLeft/90)*100}%`}}/>
                    </div>
                    <div style={{fontSize:'.75rem',color:'var(--tlt)'}}>After trial: {currentPlan.price}</div>
                  </div>
                ):(
                  <div>
                    <div style={{fontFamily:'var(--fd)',fontSize:'2rem',fontWeight:700,color:currentPlan.color}}>{currentPlan.price}</div>
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
                    <div style={{display:'flex',gap:10,alignItems:'center'}}>
                      <a href={`mailto:${enq.homeowner_email}`} style={{padding:'8px 16px',background:'var(--t)',color:'#fff',borderRadius:8,fontSize:'.8rem',fontWeight:600,textDecoration:'none'}}>Reply via Email</a>
                      {enq.homeowner_phone&&<a href={`tel:${enq.homeowner_phone}`} style={{padding:'8px 16px',border:'1.5px solid var(--borderl)',color:'var(--tm)',borderRadius:8,fontSize:'.8rem',fontWeight:600,textDecoration:'none'}}>📞 Call</a>}
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
                  <div style={{fontSize:'.75rem',color:'var(--tlt)',marginBottom:16}}>{p.annual}/year</div>
                  <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
                    <div style={{fontSize:'.82rem',color:'var(--tm)'}}>✓ {p.listings} listings</div>
                    <div style={{fontSize:'.82rem',color:'var(--tm)'}}>✓ Visible for {p.visibility}</div>
                    <div style={{fontSize:'.82rem',color:'var(--tm)'}}>✓ Email notifications</div>
                    <div style={{fontSize:'.82rem',color:'var(--tm)'}}>✓ Enquiry dashboard</div>
                  </div>
                  <button style={{width:'100%',padding:'11px',border:`2px solid ${p.color}`,borderRadius:10,background:plan===p.id?p.color:'transparent',color:plan===p.id?'#fff':p.color,fontWeight:700,cursor:'pointer',fontSize:'.85rem'}}>
                    {plan===p.id?(isTrialActive?'Current Plan (Trial)':'Current Plan'):'Switch Plan'}
                  </button>
                </div>
              ))}
            </div>
            {isTrialActive&&(
              <div style={{background:'#fff',borderRadius:16,padding:'24px',border:'1.5px solid var(--borderl)',display:'flex',alignItems:'center',gap:20}}>
                <span style={{fontSize:'2.5rem'}}>🎉</span>
                <div>
                  <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:4}}>Free Trial Active!</h3>
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