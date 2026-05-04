'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

const BUDGETS = ['₹1-5 Lakhs','₹5-10 Lakhs','₹10-25 Lakhs','₹25-50 Lakhs','₹50 Lakhs+'];
const TIMELINES = ['Immediately','Within 1 month','1-3 months','3-6 months','Just exploring'];

export default function ListingDetailClient({ listing, professional }) {
  const sb = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState('');
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryBudget, setEnquiryBudget] = useState('');
  const [enquiryTimeline, setEnquiryTimeline] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquiryProjectType, setEnquiryProjectType] = useState('');

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => {
      setUser(data.user || null);
      setChecked(true);
    });
  }, []);

  const allPhotos = [listing.cover_image, ...(Array.isArray(listing.photos) ? listing.photos : [])].filter(Boolean);

  function inr(paise) {
    if (!paise) return 'Get Quote';
    const amount = paise / 100;
    if (amount >= 100000) return `₹${(amount/100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount/1000).toFixed(0)}K`;
    return `₹${amount.toLocaleString()}`;
  }

  async function sendEnquiry() {
    if (!enquiryName||!enquiryPhone||!enquiryBudget||!enquiryMessage) return setErr('Please fill all required fields');
    if (!user?.id) return setErr('Please sign in to send an enquiry');
    setBusy(true); setErr('');
    try {
      const { data: row, error: dbErr } = await sb.from('enquiries').insert({
        listing_id: listing.id,
        professional_id: listing.owner_id || listing.user_id,
        homeowner_id: user.id,
        homeowner_name: enquiryName,
        homeowner_phone: enquiryPhone,
        homeowner_email: user.email || null,
        budget: enquiryBudget,
        timeline: enquiryTimeline,
        project_type: enquiryProjectType,
        message: enquiryMessage,
        status: 'new',
      }).select('id').single();
      if (dbErr) throw dbErr;

      // Don't block success on email delivery — the row is the source of truth.
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'enquiry', enquiryId: row.id }),
      }).catch(() => {});

      setSuccess(true);
    } catch(e) {
      setErr(e.message||'Something went wrong.');
    } finally { setBusy(false); }
  }

  const inputStyle = {width:'100%',padding:'11px 14px',border:'1.5px solid var(--borderl)',borderRadius:10,fontSize:'.88rem',color:'var(--b)',background:'#fff',outline:'none',fontFamily:'var(--fb)',boxSizing:'border-box'};
  const labelStyle = {display:'block',fontSize:'.78rem',fontWeight:600,color:'var(--b)',marginBottom:5};

  return (
    <div style={{background:'var(--c)',minHeight:'100vh',paddingTop:64}}>

      {/* Photo Gallery */}
      <div style={{background:'#000',position:'relative'}}>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'0 44px',display:'grid',gridTemplateColumns:allPhotos.length>1?'1fr 280px':'1fr',gap:4,height:460}}>
          <div style={{position:'relative',overflow:'hidden'}}>
            {allPhotos[activePhoto]
              ?<img src={allPhotos[activePhoto]} alt={listing.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              :<div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#F5DDD0,#FBF0E8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'5rem'}}>🏠</div>
            }
          </div>
          {allPhotos.length>1&&(
            <div style={{display:'flex',flexDirection:'column',gap:4,overflow:'hidden'}}>
              {allPhotos.slice(1,4).map((photo,i)=>(
                <div key={i} onClick={()=>setActivePhoto(i+1)} style={{flex:1,overflow:'hidden',cursor:'pointer',position:'relative'}}>
                  <img src={photo} alt={`Photo ${i+2}`} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  {i===2&&allPhotos.length>4&&(
                    <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'1.1rem'}}>+{allPhotos.length-4} more</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:1100,margin:'0 auto',padding:'32px 44px 72px',display:'grid',gridTemplateColumns:'1fr 360px',gap:32}}>

        {/* Left */}
        <div>
          <div style={{fontSize:'.78rem',color:'var(--tlt)',marginBottom:16,display:'flex',alignItems:'center',gap:6}}>
            <a href="/browse" style={{color:'var(--t)'}}>Browse</a>
            <span>›</span><span>{listing.city}</span><span>›</span><span>{listing.listing_type}</span>
          </div>
          <h1 style={{fontFamily:'var(--fd)',fontSize:'clamp(1.6rem,3vw,2.2rem)',color:'var(--b)',marginBottom:12,lineHeight:1.2}}>{listing.title}</h1>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:24}}>
            {listing.city&&<Tag icon="📍" label={listing.city}/>}
            {listing.style&&<Tag icon="✨" label={listing.style}/>}
            {listing.project_type&&<Tag icon="🏠" label={listing.project_type}/>}
            {listing.bedrooms&&<Tag icon="🛏" label={listing.bedrooms}/>}
            {listing.sqft&&<Tag icon="📐" label={`${listing.sqft} sqft`}/>}
          </div>
          <div style={{background:'#fff',borderRadius:16,padding:'24px',border:'1.5px solid var(--borderl)',marginBottom:24}}>
            <h2 style={{fontFamily:'var(--fd)',color:'var(--b)',fontSize:'1.2rem',marginBottom:12}}>About this project</h2>
            <p style={{color:'var(--tm)',lineHeight:1.8,fontSize:'.92rem'}}>{listing.description||'A thoughtfully designed space.'}</p>
          </div>
          {listing.tags&&listing.tags.length>0&&(
            <div style={{background:'#fff',borderRadius:16,padding:'24px',border:'1.5px solid var(--borderl)',marginBottom:24}}>
              <h2 style={{fontFamily:'var(--fd)',color:'var(--b)',fontSize:'1.1rem',marginBottom:14}}>Features</h2>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {listing.tags.map(tag=><span key={tag} style={{padding:'5px 14px',background:'var(--c)',color:'var(--tm)',borderRadius:50,fontSize:'.78rem',fontWeight:500,border:'1px solid var(--borderl)'}}>#{tag}</span>)}
              </div>
            </div>
          )}
          {professional&&(
            <div style={{background:'#fff',borderRadius:16,padding:'24px',border:'1.5px solid var(--borderl)'}}>
              <h2 style={{fontFamily:'var(--fd)',color:'var(--b)',fontSize:'1.1rem',marginBottom:16}}>About the Professional</h2>
              <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:16}}>
                <div style={{width:56,height:56,borderRadius:'50%',background:'linear-gradient(135deg,var(--t),var(--bm))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#fff',fontSize:'1.2rem',flexShrink:0}}>
                  {(professional.full_name||'P').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div style={{fontWeight:700,color:'var(--b)',fontSize:'.95rem'}}>{professional.full_name}</div>
                  <div style={{fontSize:'.78rem',color:'var(--tlt)'}}>{professional.pro_type||'Professional'} · {professional.primary_city||listing.city}</div>
                </div>
              </div>
              {professional.bio&&<p style={{color:'var(--tm)',fontSize:'.88rem',lineHeight:1.75}}>{professional.bio}</p>}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{position:'sticky',top:80,height:'fit-content',display:'flex',flexDirection:'column',gap:16}}>
          <div style={{background:'#fff',borderRadius:20,padding:'24px',border:'1.5px solid var(--borderl)',boxShadow:'var(--shm)'}}>
            <div style={{fontFamily:'var(--fd)',fontSize:'2rem',fontWeight:700,color:'var(--t)',lineHeight:1,marginBottom:4}}>
              {listing.price_unit==='on request'?'Price on Request':inr(listing.price_paise)}
            </div>
            {listing.price_unit&&listing.price_unit!=='on request'&&<div style={{fontSize:'.78rem',color:'var(--tlt)',marginBottom:20}}>{listing.price_unit}</div>}

            {!checked?(
              <div style={{padding:'12px',textAlign:'center',color:'var(--tlt)',fontSize:'.85rem'}}>Loading...</div>
            ):user?(
              <div>
                {!showEnquiry?(
                  <button onClick={()=>setShowEnquiry(true)} style={{width:'100%',padding:'14px',background:'var(--t)',color:'#fff',border:'none',borderRadius:12,fontWeight:700,cursor:'pointer',fontSize:'.95rem',boxShadow:'0 6px 20px rgba(196,98,45,.3)',marginBottom:10}}>
                    💬 Send Enquiry
                  </button>
                ):success?(
                  <div style={{background:'#F0FDF4',border:'1.5px solid #86EFAC',borderRadius:12,padding:'16px',textAlign:'center'}}>
                    <div style={{fontSize:'2rem',marginBottom:8}}>✅</div>
                    <div style={{fontWeight:700,color:'#166534',marginBottom:4}}>Enquiry Sent!</div>
                    <div style={{fontSize:'.82rem',color:'#16a34a'}}>The professional will contact you soon.</div>
                  </div>
                ):(
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    <div><label style={labelStyle}>Your Name *</label><input value={enquiryName} onChange={e=>setEnquiryName(e.target.value)} placeholder="Amit Sharma" style={inputStyle}/></div>
                    <div><label style={labelStyle}>Phone Number *</label><input type="tel" value={enquiryPhone} onChange={e=>setEnquiryPhone(e.target.value)} placeholder="9876543210" style={inputStyle}/></div>
                    <div>
                      <label style={labelStyle}>Project Type</label>
                      <select value={enquiryProjectType} onChange={e=>setEnquiryProjectType(e.target.value)} style={{...inputStyle,cursor:'pointer'}}>
                        <option value="">Select type</option>
                        {['Residential','Commercial','Office','Villa','Apartment','Retail'].map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Budget *</label>
                      <select value={enquiryBudget} onChange={e=>setEnquiryBudget(e.target.value)} style={{...inputStyle,cursor:'pointer'}}>
                        <option value="">Select budget</option>
                        {BUDGETS.map(b=><option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>When to start?</label>
                      <select value={enquiryTimeline} onChange={e=>setEnquiryTimeline(e.target.value)} style={{...inputStyle,cursor:'pointer'}}>
                        <option value="">Select timeline</option>
                        {TIMELINES.map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div><label style={labelStyle}>Message *</label><textarea value={enquiryMessage} onChange={e=>setEnquiryMessage(e.target.value)} placeholder="Tell the professional about your project..." style={{...inputStyle,height:80,resize:'vertical'}}/></div>
                    {err&&<div style={{color:'#DC2626',fontSize:'.8rem',background:'#FEF2F2',padding:'8px 12px',borderRadius:8}}>{err}</div>}
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={()=>setShowEnquiry(false)} style={{flex:1,padding:'11px',border:'1.5px solid var(--borderl)',borderRadius:10,background:'#fff',color:'var(--tm)',fontWeight:600,cursor:'pointer',fontSize:'.85rem'}}>Cancel</button>
                      <button onClick={sendEnquiry} disabled={busy} style={{flex:2,padding:'11px',background:busy?'var(--borderl)':'var(--t)',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:busy?'not-allowed':'pointer',fontSize:'.88rem'}}>
                        {busy?'Sending...':'Send →'}
                      </button>
                    </div>
                  </div>
                )}
                {professional?.whatsapp_public&&professional?.phone&&!showEnquiry&&(
                  <a href={`https://wa.me/91${professional.phone}?text=${encodeURIComponent(`Hi! I found your profile on Homeizz. Listing: ${listing.title}`)}`} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:'12px',background:'#25D366',color:'#fff',border:'none',borderRadius:12,fontWeight:700,cursor:'pointer',fontSize:'.9rem',textDecoration:'none',boxSizing:'border-box',marginTop:10}}>
                    📱 WhatsApp Directly
                  </a>
                )}
              </div>
            ):(
              <div>
                <div style={{background:'var(--tpp)',borderRadius:12,padding:'16px',marginBottom:14,textAlign:'center',border:'1.5px solid var(--tp)'}}>
                  <div style={{fontSize:'1.5rem',marginBottom:6}}>🔒</div>
                  <div style={{fontWeight:700,color:'var(--b)',fontSize:'.88rem',marginBottom:4}}>Sign up to send enquiry</div>
                  <div style={{fontSize:'.75rem',color:'var(--tlt)'}}>Free to join — takes 30 seconds</div>
                </div>
                <button onClick={()=>router.push(`/auth?redirect=/listing/${listing.id}`)} style={{width:'100%',padding:'14px',background:'var(--t)',color:'#fff',border:'none',borderRadius:12,fontWeight:700,cursor:'pointer',fontSize:'.95rem',boxShadow:'0 6px 20px rgba(196,98,45,.3)',marginBottom:10}}>
                  Sign up to Contact →
                </button>
                <button onClick={()=>router.push(`/auth?redirect=/listing/${listing.id}`)} style={{width:'100%',padding:'12px',background:'transparent',color:'var(--t)',border:'1.5px solid var(--t)',borderRadius:12,fontWeight:600,cursor:'pointer',fontSize:'.88rem'}}>
                  Already have account? Sign in
                </button>
              </div>
            )}
            <div style={{display:'flex',alignItems:'center',gap:6,justifyContent:'center',marginTop:14,color:'var(--tlt)',fontSize:'.72rem'}}>🔒 Your details are safe with Homeizz</div>
          </div>

          <div style={{background:'#fff',borderRadius:16,padding:'20px',border:'1.5px solid var(--borderl)'}}>
            <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',fontSize:'1rem',marginBottom:14}}>Listing Details</h3>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {[
                {label:'Type',value:listing.listing_type},
                {label:'Style',value:listing.style},
                {label:'City',value:listing.city},
                {label:'Project Type',value:listing.project_type},
                {label:'Bedrooms',value:listing.bedrooms},
                {label:'Area',value:listing.sqft?`${listing.sqft} sqft`:null},
              ].filter(f=>f.value).map(f=>(
                <div key={f.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--borderl)'}}>
                  <span style={{fontSize:'.78rem',color:'var(--tlt)'}}>{f.label}</span>
                  <span style={{fontSize:'.82rem',fontWeight:600,color:'var(--b)'}}>{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tag({ icon, label }) {
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'5px 12px',background:'#fff',border:'1.5px solid var(--borderl)',borderRadius:50,fontSize:'.78rem',color:'var(--tm)',fontWeight:500}}>
      {icon} {label}
    </span>
  );
}