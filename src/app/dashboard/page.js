'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export const dynamic = 'force-dynamic';

export default function HomeownerDashboard() {
  const sb = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('enquiries');

  useEffect(() => {
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth'); return; }
      if (data.user.user_metadata?.role === 'professional') { router.push('/pro-dashboard'); return; }
      setUser(data.user);
      const { data: enqs } = await sb.from('enquiries').select('*, listings(title, cover_image, city)').eq('homeowner_id', data.user.id).order('created_at', { ascending: false });
      setEnquiries(enqs || []);
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
        <div style={{color:'var(--tlt)',fontSize:'.9rem'}}>Loading...</div>
      </div>
    </div>
  );

  const meta = user?.user_metadata || {};
  const displayName = meta.full_name || user?.email?.split('@')[0] || 'Homeowner';
  const initials = displayName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  const STATUS_COLORS = {
    new: { bg:'#FEF3C7', color:'#92400E', label:'New' },
    replied: { bg:'#D1FAE5', color:'#065F46', label:'Replied' },
    accepted: { bg:'#DBEAFE', color:'#1E40AF', label:'Accepted' },
    closed: { bg:'#F3F4F6', color:'#6B7280', label:'Closed' },
  };

  return (
    <div style={{minHeight:'100vh',background:'#F5F0EB'}}>

      {/* Top nav */}
      <nav style={{background:'var(--b)',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',position:'fixed',top:0,left:0,right:0,zIndex:100}}>
        <div onClick={()=>router.push('/')} style={{fontFamily:'var(--fd)',fontSize:'1.4rem',fontWeight:700,color:'var(--t)',cursor:'pointer'}}>
          Home<span style={{color:'var(--sandl)'}}>izz</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{color:'rgba(255,255,255,.6)',fontSize:'.85rem'}}>👋 {displayName}</div>
          <div onClick={signOut} style={{color:'rgba(255,255,255,.4)',fontSize:'.82rem',cursor:'pointer',padding:'6px 12px',border:'1px solid rgba(255,255,255,.15)',borderRadius:8}}>Sign Out</div>
        </div>
      </nav>

      <div style={{paddingTop:64,maxWidth:900,margin:'0 auto',padding:'80px 24px 60px'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:32}}>
          <div style={{width:56,height:56,borderRadius:'50%',background:'linear-gradient(135deg,var(--t),var(--bm))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#fff',fontSize:'1.2rem'}}>
            {initials}
          </div>
          <div>
            <h1 style={{fontFamily:'var(--fd)',fontSize:'1.6rem',color:'var(--b)',marginBottom:2}}>Welcome, {displayName.split(' ')[0]}! 👋</h1>
            <p style={{color:'var(--tlt)',fontSize:'.85rem'}}>{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:28}}>
          {[
            {label:'Enquiries Sent',value:enquiries.length,icon:'💬',color:'#C4622D'},
            {label:'Replies Received',value:enquiries.filter(e=>e.status==='replied'||e.status==='accepted').length,icon:'✅',color:'#6B7F5E'},
            {label:'Active Projects',value:enquiries.filter(e=>e.status==='accepted').length,icon:'🏠',color:'#B8860B'},
          ].map(stat=>(
            <div key={stat.label} style={{background:'#fff',borderRadius:16,padding:'20px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
              <div style={{fontSize:'1.5rem',marginBottom:8}}>{stat.icon}</div>
              <div style={{fontFamily:'var(--fd)',fontSize:'2rem',fontWeight:700,color:stat.color,lineHeight:1}}>{stat.value}</div>
              <div style={{fontSize:'.78rem',color:'var(--tlt)',marginTop:4}}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:4,background:'#fff',borderRadius:12,padding:4,marginBottom:24,border:'1.5px solid var(--borderl)',width:'fit-content'}}>
          {[
            {id:'enquiries',label:'My Enquiries'},
            {id:'profile',label:'My Profile'},
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'9px 20px',border:'none',borderRadius:9,background:tab===t.id?'var(--t)':'transparent',color:tab===t.id?'#fff':'var(--tlt)',fontWeight:600,cursor:'pointer',fontSize:'.85rem',transition:'all .2s'}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ENQUIRIES TAB */}
        {tab==='enquiries'&&(
          <div>
            {enquiries.length===0?(
              <div style={{background:'#fff',borderRadius:20,padding:'60px 40px',textAlign:'center',border:'2px dashed var(--borderl)'}}>
                <div style={{fontSize:'3rem',marginBottom:16}}>💬</div>
                <h3 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:8}}>No enquiries yet</h3>
                <p style={{color:'var(--tlt)',fontSize:'.88rem',marginBottom:24}}>Browse designers and send your first enquiry!</p>
                <button onClick={()=>router.push('/browse')} style={{padding:'12px 28px',background:'var(--t)',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer',fontSize:'.9rem'}}>
                  Browse Designers →
                </button>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                {enquiries.map(enq=>{
                  const s = STATUS_COLORS[enq.status] || STATUS_COLORS.new;
                  return (
                    <div key={enq.id} style={{background:'#fff',borderRadius:16,padding:'20px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)',display:'flex',gap:16,alignItems:'flex-start'}}>
                      {enq.listings?.cover_image&&(
                        <img src={enq.listings.cover_image} alt="" style={{width:80,height:80,objectFit:'cover',borderRadius:10,flexShrink:0}}/>
                      )}
                      <div style={{flex:1}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                          <div style={{fontWeight:700,color:'var(--b)',fontSize:'.95rem'}}>{enq.listings?.title||'Listing'}</div>
                          <span style={{background:s.bg,color:s.color,fontSize:'.7rem',fontWeight:700,padding:'4px 10px',borderRadius:50}}>{s.label}</span>
                        </div>
                        <div style={{fontSize:'.78rem',color:'var(--tlt)',marginBottom:8}}>📍 {enq.listings?.city} · {enq.budget} · {enq.project_type}</div>
                        <div style={{fontSize:'.82rem',color:'var(--tm)',background:'var(--c)',padding:'10px 12px',borderRadius:8,lineHeight:1.6}}>{enq.message}</div>
                        <div style={{fontSize:'.72rem',color:'var(--tlt)',marginTop:8}}>{new Date(enq.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {tab==='profile'&&(
          <div style={{background:'#fff',borderRadius:16,padding:'28px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
            <h2 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:20}}>My Profile</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              {[
                {label:'Full Name',value:meta.full_name},
                {label:'Email',value:user?.email},
                {label:'Phone',value:meta.phone},
                {label:'Account Type',value:'🏠 Homeowner'},
              ].map(f=>(
                <div key={f.label} style={{padding:'14px 16px',background:'var(--c)',borderRadius:10}}>
                  <div style={{fontSize:'.72rem',fontWeight:700,color:'var(--tlt)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:4}}>{f.label}</div>
                  <div style={{fontSize:'.9rem',color:'var(--b)',fontWeight:500}}>{f.value||'Not set'}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:20,padding:'16px',background:'var(--tpp)',borderRadius:10,border:'1.5px solid var(--tp)'}}>
              <div style={{fontWeight:600,color:'var(--t)',marginBottom:4,fontSize:'.88rem'}}>🎉 Free Account</div>
              <div style={{fontSize:'.8rem',color:'var(--tm)'}}>Homeowner accounts are always free on Homeizz. Browse and contact as many designers as you want!</div>
            </div>
          </div>
        )}

        {/* Browse CTA */}
        <div style={{marginTop:24,background:'var(--b)',borderRadius:16,padding:'24px 28px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontFamily:'var(--fd)',color:'#fff',fontSize:'1.1rem',marginBottom:4}}>Find your perfect designer</div>
            <div style={{color:'rgba(255,255,255,.5)',fontSize:'.82rem'}}>Browse 500+ verified professionals across India</div>
          </div>
          <button onClick={()=>router.push('/browse')} style={{padding:'12px 24px',background:'var(--t)',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer',fontSize:'.88rem',whiteSpace:'nowrap'}}>
            Browse Now →
          </button>
        </div>
      </div>
    </div>
  );
}