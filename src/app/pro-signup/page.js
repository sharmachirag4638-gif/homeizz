'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export const dynamic = 'force-dynamic';

const CITIES = [
  'Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Pune','Kolkata',
  'Ahmedabad','Jaipur','Surat','Lucknow','Kanpur','Nagpur','Indore',
  'Thane','Bhopal','Visakhapatnam','Patna','Vadodara','Ghaziabad',
  'Ludhiana','Agra','Nashik','Faridabad','Meerut','Rajkot','Kochi',
  'Amritsar','Aurangabad','Srinagar'
];

const STYLES = [
  'Modern','Minimalist','Traditional','Contemporary','Industrial',
  'Luxury','Budget-friendly','Scandinavian','Bohemian','Art Deco'
];

const PROJECT_TYPES = [
  'Residential','Commercial','Office','Retail','Hospitality','Villa','Apartment','Bungalow'
];

const PLANS = [
  {id:'starter',name:'Starter',monthly:499,annual:4990,annualMonthly:416,listings:3,visibility:'60 days',color:'#6B7F5E',popular:false},
  {id:'growth',name:'Growth',monthly:1499,annual:14990,annualMonthly:1249,listings:10,visibility:'150 days',color:'#C4622D',popular:true},
  {id:'pro',name:'Pro',monthly:3999,annual:39990,annualMonthly:3333,listings:25,visibility:'6 months',color:'#B8860B',popular:false},
];

const STEPS = [
  {id:1,label:'Account'},{id:2,label:'Profile Type'},{id:3,label:'Details'},
  {id:4,label:'Location'},{id:5,label:'Specialities'},{id:6,label:'Portfolio'},{id:7,label:'Plan'}
];

const labelStyle = {display:'block',fontSize:'.82rem',fontWeight:600,color:'var(--b)',marginBottom:6};
const inputStyle = {width:'100%',padding:'12px 14px',border:'1.5px solid var(--borderl)',borderRadius:10,fontSize:'.9rem',color:'var(--b)',background:'#fff',outline:'none',fontFamily:'var(--fb)'};

function Field({label,type='text',value,onChange,placeholder}){
  return(
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} style={inputStyle}/>
    </div>
  );
}

function SelectField({label,value,onChange,options,placeholder}){
  return(
    <div>
      <label style={labelStyle}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{...inputStyle,cursor:'pointer'}}>
        <option value="">{placeholder||'Select an option'}</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function ProSignup(){
  const sb = createClient();
  const router = useRouter();
  const [step,setStep] = useState(1);
  const [busy,setBusy] = useState(false);
  const [err,setErr] = useState('');
  const [billing,setBilling] = useState('monthly');

  const [email,setEmail] = useState('');
  const [phone,setPhone] = useState('');
  const [password,setPassword] = useState('');
  const [confirmPassword,setConfirmPassword] = useState('');
  const [profileType,setProfileType] = useState('');
  const [name,setName] = useState('');
  const [pan,setPan] = useState('');
  const [companyName,setCompanyName] = useState('');
  const [gst,setGst] = useState('');
  const [contactPerson,setContactPerson] = useState('');
  const [proType,setProType] = useState('');
  const [experience,setExperience] = useState('');
  const [projectsCompleted,setProjectsCompleted] = useState('');
  const [avgCompletionTime,setAvgCompletionTime] = useState('');
  const [minBudget,setMinBudget] = useState('');
  const [primaryCity,setPrimaryCity] = useState('');
  const [otherCities,setOtherCities] = useState([]);
  const [panIndia,setPanIndia] = useState(false);
  const [styles,setStyles] = useState([]);
  const [otherStyle,setOtherStyle] = useState('');
  const [projectTypes,setProjectTypes] = useState([]);
  const [otherProjectType,setOtherProjectType] = useState('');
  const [bio,setBio] = useState('');
  const [instagram,setInstagram] = useState('');
  const [website,setWebsite] = useState('');
  const [googleBusiness,setGoogleBusiness] = useState('');
  const [selectedPlan,setSelectedPlan] = useState('growth');

  useEffect(()=>{
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
    return ()=>{ document.body.removeChild(script); };
  },[]);

  function toggleOtherCity(city){setOtherCities(prev=>prev.includes(city)?prev.filter(c=>c!==city):[...prev,city]);}
  function toggleStyle(s){setStyles(prev=>prev.includes(s)?prev.filter(x=>x!==s):[...prev,s]);}
  function toggleProjectType(t){setProjectTypes(prev=>prev.includes(t)?prev.filter(x=>x!==t):[...prev,t]);}

  function nextStep(){
    setErr('');
    if(step===1){
      if(!email||!phone||!password||!confirmPassword) return setErr('Please fill all fields');
      if(password!==confirmPassword) return setErr('Passwords do not match');
      if(password.length<8) return setErr('Password must be at least 8 characters');
    }
    if(step===2){
      if(!profileType) return setErr('Please select Individual or Firm');
      if(profileType==='individual'&&(!name||!pan)) return setErr('Please fill all fields');
      if(profileType==='firm'&&(!companyName||!gst||!contactPerson)) return setErr('Please fill all fields');
    }
    if(step===3){if(!proType||!experience||!minBudget) return setErr('Please fill all required fields');}
    if(step===4){if(!primaryCity) return setErr('Please select your primary city');}
    if(step===5){
      if(styles.length===0&&!otherStyle.trim()) return setErr('Select at least one style');
      if(projectTypes.length===0&&!otherProjectType.trim()) return setErr('Select at least one project type');
    }
    setStep(s=>s+1);
  }

  async function createAccount(razorpaySubId){
    const displayName = profileType==='individual'?name:companyName;
    const allStyles = otherStyle.trim() ? [...styles, otherStyle.trim()] : styles;
    const allProjectTypes = otherProjectType.trim() ? [...projectTypes, otherProjectType.trim()] : projectTypes;
    const {error} = await sb.auth.signUp({
      email, password,
      options:{data:{
        full_name:displayName, phone, role:'professional',
        profile_type:profileType,
        pan:profileType==='individual'?pan:null,
        company_name:profileType==='firm'?companyName:null,
        gst:profileType==='firm'?gst:null,
        contact_person:profileType==='firm'?contactPerson:null,
        pro_type:proType, experience,
        projects_completed:projectsCompleted,
        avg_completion_time:avgCompletionTime,
        min_budget:minBudget, primary_city:primaryCity,
        other_cities:otherCities, pan_india:panIndia,
        styles:allStyles, project_types:allProjectTypes,
        bio, instagram, website,
        google_business:googleBusiness,
        plan:selectedPlan, billing,
        razorpay_subscription_id:razorpaySubId||null,
        trial_start:new Date().toISOString(),
        trial_end:new Date(Date.now()+90*24*60*60*1000).toISOString(),
      }},
    });
    if(error) throw error;
    router.push(`/verify?email=${encodeURIComponent(email)}&role=professional`);
  }

  async function submit(){
    setBusy(true); setErr('');
    try {
      await createAccount(null);
    } catch(e){
      setErr(e.message||'Something went wrong');
      setBusy(false);
    }
  }

  return(
    <div style={{minHeight:'100vh',background:'var(--c)',paddingTop:64}}>
      <nav className="nav">
        <div className="nav-logo" onClick={()=>router.push('/')}>Home<span>izz</span></div>
        <div style={{fontSize:'.85rem',color:'var(--tlt)'}}>Professional Signup</div>
      </nav>

      <div style={{maxWidth:680,margin:'0 auto',padding:'40px 20px 80px'}}>
        <div style={{marginBottom:40}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
            {STEPS.map(s=>(
              <div key={s.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,flex:1}}>
                <div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:step>s.id?'#6B7F5E':step===s.id?'var(--t)':'var(--borderl)',color:step>=s.id?'#fff':'var(--tlt)',fontWeight:700,fontSize:'.8rem'}}>
                  {step>s.id?'✓':s.id}
                </div>
                <span style={{fontSize:'.6rem',color:step===s.id?'var(--t)':'var(--tlt)',fontWeight:step===s.id?700:400}}>{s.label}</span>
              </div>
            ))}
          </div>
          <div style={{height:4,background:'var(--borderl)',borderRadius:2}}>
            <div style={{height:'100%',background:'var(--t)',borderRadius:2,width:`${((step-1)/6)*100}%`,transition:'width .4s'}}/>
          </div>
        </div>

        <div style={{background:'#fff',borderRadius:20,padding:'36px 40px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>
          {err&&<div style={{background:'#FEF2F2',border:'1px solid #FECACA',color:'#DC2626',borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:'.875rem'}}>{err}</div>}

          {step===1&&(
            <div>
              <h2 style={{marginBottom:6,fontFamily:'var(--fd)'}}>Create your account</h2>
              <p style={{marginBottom:28,fontSize:'.9rem'}}>Start your free 3-month trial - no credit card needed now</p>
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com"/>
                <Field label="Phone number" type="tel" value={phone} onChange={setPhone} placeholder="Enter your phone number"/>
                <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Min 8 characters"/>
                <Field label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat password"/>
              </div>
            </div>
          )}

          {step===2&&(
            <div>
              <h2 style={{marginBottom:6,fontFamily:'var(--fd)'}}>Individual or Firm?</h2>
              <p style={{marginBottom:28,fontSize:'.9rem'}}>This helps homeowners know who they are working with</p>
              <div style={{display:'flex',gap:14,marginBottom:28}}>
                {[{id:'individual',icon:'👤',title:'Individual',sub:'Freelance designer or architect'},{id:'firm',icon:'🏢',title:'Firm / Company',sub:'Registered business or studio'}].map(opt=>(
                  <div key={opt.id} onClick={()=>setProfileType(opt.id)} style={{flex:1,border:`2px solid ${profileType===opt.id?'var(--t)':'var(--borderl)'}`,borderRadius:14,padding:'20px 16px',cursor:'pointer',textAlign:'center',background:profileType===opt.id?'var(--tpp)':'#fff'}}>
                    <div style={{fontSize:'2rem',marginBottom:8}}>{opt.icon}</div>
                    <div style={{fontWeight:700,color:'var(--b)',marginBottom:4}}>{opt.title}</div>
                    <div style={{fontSize:'.78rem',color:'var(--tlt)'}}>{opt.sub}</div>
                  </div>
                ))}
              </div>
              {profileType==='individual'&&(
                <div style={{display:'flex',flexDirection:'column',gap:16}}>
                  <Field label="Full Name" value={name} onChange={setName} placeholder="Your full name"/>
                  <Field label="PAN Card Number" value={pan} onChange={setPan} placeholder="ABCDE1234F"/>
                </div>
              )}
              {profileType==='firm'&&(
                <div style={{display:'flex',flexDirection:'column',gap:16}}>
                  <Field label="Company Name" value={companyName} onChange={setCompanyName} placeholder="Your firm name"/>
                  <Field label="GST Number" value={gst} onChange={setGst} placeholder="22AAAAA0000A1Z5"/>
                  <Field label="Contact Person Name" value={contactPerson} onChange={setContactPerson} placeholder="Owner or manager name"/>
                </div>
              )}
            </div>
          )}

          {step===3&&(
            <div>
              <h2 style={{marginBottom:6,fontFamily:'var(--fd)'}}>Professional Details</h2>
              <p style={{marginBottom:28,fontSize:'.9rem'}}>Tell homeowners about your expertise</p>
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div>
                  <label style={labelStyle}>I am a *</label>
                  <div style={{display:'flex',gap:10}}>
                    {['Architect','Interior Designer','Both'].map(t=>(
                      <div key={t} onClick={()=>setProType(t)} style={{flex:1,padding:'10px 8px',border:`2px solid ${proType===t?'var(--t)':'var(--borderl)'}`,borderRadius:10,cursor:'pointer',textAlign:'center',fontSize:'.82rem',fontWeight:600,background:proType===t?'var(--tpp)':'#fff',color:proType===t?'var(--t)':'var(--tm)'}}>
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
                <SelectField label="Years of Experience *" value={experience} onChange={setExperience} options={['< 1 year','1-3 years','3-5 years','5-10 years','10-15 years','15+ years']}/>
                <SelectField label="Projects Completed" value={projectsCompleted} onChange={setProjectsCompleted} options={['< 10','10-25','25-50','50-100','100-200','200+']}/>
                <SelectField label="Average Project Duration" value={avgCompletionTime} onChange={setAvgCompletionTime} options={['< 1 month','1-3 months','3-6 months','6-12 months','1-2 years','2+ years']}/>
                <SelectField label="Minimum Project Budget *" value={minBudget} onChange={setMinBudget} options={['Rs 1-5 Lakhs','Rs 5-10 Lakhs','Rs 10-25 Lakhs','Rs 25-50 Lakhs','Rs 50 Lakhs+']}/>
              </div>
            </div>
          )}

          {step===4&&(
            <div>
              <h2 style={{marginBottom:6,fontFamily:'var(--fd)'}}>Location & Coverage</h2>
              <p style={{marginBottom:28,fontSize:'.9rem'}}>Where do you take projects?</p>
              <div style={{display:'flex',flexDirection:'column',gap:20}}>
                <SelectField label="Primary City *" value={primaryCity} onChange={setPrimaryCity} options={CITIES} placeholder="Select your main city"/>
                <div>
                  <label style={labelStyle}>Other cities you serve</label>
                  <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
                    {CITIES.filter(c=>c!==primaryCity).map(city=>(
                      <div key={city} onClick={()=>toggleOtherCity(city)} style={{padding:'6px 14px',borderRadius:50,border:`1.5px solid ${otherCities.includes(city)?'var(--t)':'var(--borderl)'}`,background:otherCities.includes(city)?'var(--tpp)':'#fff',color:otherCities.includes(city)?'var(--t)':'var(--tm)',fontSize:'.8rem',fontWeight:500,cursor:'pointer'}}>
                        {city}
                      </div>
                    ))}
                  </div>
                </div>
                <div onClick={()=>setPanIndia(!panIndia)} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',border:`2px solid ${panIndia?'var(--t)':'var(--borderl)'}`,borderRadius:12,cursor:'pointer',background:panIndia?'var(--tpp)':'#fff'}}>
                  <div style={{width:22,height:22,borderRadius:6,border:`2px solid ${panIndia?'var(--t)':'var(--borderl)'}`,background:panIndia?'var(--t)':'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    {panIndia&&<span style={{color:'#fff',fontSize:'14px'}}>✓</span>}
                  </div>
                  <div>
                    <div style={{fontWeight:600,color:'var(--b)',fontSize:'.9rem'}}>I take Pan-India projects</div>
                    <div style={{fontSize:'.78rem',color:'var(--tlt)'}}>Remote consultations across India</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step===5&&(
            <div>
              <h2 style={{marginBottom:6,fontFamily:'var(--fd)'}}>Your Specialities</h2>
              <p style={{marginBottom:28,fontSize:'.9rem'}}>Homeowners search by style and project type</p>
              <div style={{display:'flex',flexDirection:'column',gap:24}}>
                <div>
                  <label style={labelStyle}>Design Styles *</label>
                  <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
                    {STYLES.map(s=>(
                      <div key={s} onClick={()=>toggleStyle(s)} style={{padding:'8px 16px',borderRadius:50,border:`1.5px solid ${styles.includes(s)?'var(--t)':'var(--borderl)'}`,background:styles.includes(s)?'var(--tpp)':'#fff',color:styles.includes(s)?'var(--t)':'var(--tm)',fontSize:'.85rem',fontWeight:500,cursor:'pointer'}}>
                        {s}
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:12}}>
                    <label style={{...labelStyle,fontWeight:400,color:'var(--tlt)'}}>Other style (optional)</label>
                    <input value={otherStyle} onChange={e=>setOtherStyle(e.target.value)} placeholder="e.g. Japandi, Coastal, Wabi-Sabi..." style={inputStyle}/>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Project Types *</label>
                  <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
                    {PROJECT_TYPES.map(t=>(
                      <div key={t} onClick={()=>toggleProjectType(t)} style={{padding:'8px 16px',borderRadius:50,border:`1.5px solid ${projectTypes.includes(t)?'var(--t)':'var(--borderl)'}`,background:projectTypes.includes(t)?'var(--tpp)':'#fff',color:projectTypes.includes(t)?'var(--t)':'var(--tm)',fontSize:'.85rem',fontWeight:500,cursor:'pointer'}}>
                        {t}
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:12}}>
                    <label style={{...labelStyle,fontWeight:400,color:'var(--tlt)'}}>Other project type (optional)</label>
                    <input value={otherProjectType} onChange={e=>setOtherProjectType(e.target.value)} placeholder="e.g. Heritage restoration, Co-working..." style={inputStyle}/>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step===6&&(
            <div>
              <h2 style={{marginBottom:6,fontFamily:'var(--fd)'}}>Portfolio & Bio</h2>
              <p style={{marginBottom:28,fontSize:'.9rem'}}>Show homeowners your best work</p>
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div>
                  <label style={labelStyle}>Bio</label>
                  <textarea value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell homeowners about yourself..." style={{...inputStyle,height:100,resize:'vertical'}}/>
                </div>
                <Field label="Instagram Handle" value={instagram} onChange={setInstagram} placeholder="@yourhandle"/>
                <Field label="Website (optional)" value={website} onChange={setWebsite} placeholder="https://yourwebsite.com"/>
                <Field label="Google Business Link (optional)" value={googleBusiness} onChange={setGoogleBusiness} placeholder="https://g.page/..."/>
              </div>
            </div>
          )}

          {step===7&&(
            <div>
              <h2 style={{marginBottom:6,fontFamily:'var(--fd)'}}>Choose Your Plan</h2>
              <p style={{marginBottom:24,fontSize:'.9rem'}}>Start free for 3 months - save card now, charged later</p>
              <div style={{background:'linear-gradient(135deg,#6B7F5E,#4A6040)',borderRadius:12,padding:'14px 20px',marginBottom:24,display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:'1.5rem'}}>🎉</span>
                <div>
                  <div style={{color:'#fff',fontWeight:700,fontSize:'.9rem'}}>3 Months FREE Trial</div>
                  <div style={{color:'rgba(255,255,255,.8)',fontSize:'.78rem'}}>Save your card now. First charge after 90 days.</div>
                </div>
              </div>
              <div style={{marginBottom:16,fontSize:'.82rem',color:'var(--tlt)',fontWeight:600}}>Select your plan and billing cycle:</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:8}}>
                <div style={{textAlign:'center',fontSize:'.75rem',fontWeight:700,color:'var(--tlt)',padding:'6px',background:'var(--borderl)',borderRadius:8}}>MONTHLY</div>
                <div style={{textAlign:'center',fontSize:'.75rem',fontWeight:700,color:'#6B7F5E',padding:'6px',background:'#E8F0E4',borderRadius:8}}>ANNUAL (2 months free)</div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {PLANS.map(plan=>(
                  <div key={`${plan.id}-monthly`} onClick={()=>{setSelectedPlan(plan.id);setBilling('monthly');}} style={{border:`2px solid ${selectedPlan===plan.id&&billing==='monthly'?plan.color:'var(--borderl)'}`,borderRadius:14,padding:'14px',cursor:'pointer',background:selectedPlan===plan.id&&billing==='monthly'?`${plan.color}15`:'#fff',position:'relative'}}>
                    {plan.popular&&<div style={{position:'absolute',top:-9,left:'50%',transform:'translateX(-50%)',background:plan.color,color:'#fff',fontSize:'.6rem',fontWeight:700,padding:'2px 8px',borderRadius:50,whiteSpace:'nowrap'}}>POPULAR</div>}
                    <div style={{fontWeight:700,color:'var(--b)',fontSize:'.85rem',marginBottom:2}}>{plan.name}</div>
                    <div style={{fontWeight:800,color:plan.color,fontSize:'1rem'}}>Rs {plan.monthly.toLocaleString()}<span style={{fontSize:'.65rem',fontWeight:500,color:'var(--tlt)'}}>/mo</span></div>
                    <div style={{fontSize:'.68rem',color:'var(--tlt)',marginTop:3}}>{plan.listings} listings</div>
                  </div>
                ))}
                {PLANS.map(plan=>(
                  <div key={`${plan.id}-annual`} onClick={()=>{setSelectedPlan(plan.id);setBilling('annual');}} style={{border:`2px solid ${selectedPlan===plan.id&&billing==='annual'?plan.color:'var(--borderl)'}`,borderRadius:14,padding:'14px',cursor:'pointer',background:selectedPlan===plan.id&&billing==='annual'?`${plan.color}15`:'#fff',position:'relative'}}>
                    <div style={{position:'absolute',top:-9,right:8,background:'#6B7F5E',color:'#fff',fontSize:'.55rem',fontWeight:700,padding:'2px 6px',borderRadius:50}}>SAVE</div>
                    <div style={{fontWeight:700,color:'var(--b)',fontSize:'.85rem',marginBottom:2}}>{plan.name}</div>
                    <div style={{fontWeight:800,color:plan.color,fontSize:'1rem'}}>Rs {plan.annualMonthly.toLocaleString()}<span style={{fontSize:'.65rem',fontWeight:500,color:'var(--tlt)'}}>/mo</span></div>
                    <div style={{fontSize:'.68rem',color:'#6B7F5E',fontWeight:600}}>Rs {plan.annual.toLocaleString()}/yr</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{display:'flex',gap:12,marginTop:32}}>
            {step>1&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:'14px',border:'2px solid var(--borderl)',borderRadius:12,background:'#fff',color:'var(--tm)',fontWeight:600,cursor:'pointer',fontSize:'.9rem'}}>Back</button>}
            {step<7
              ?<button onClick={nextStep} style={{flex:2,padding:'14px',border:'none',borderRadius:12,background:'var(--t)',color:'#fff',fontWeight:700,cursor:'pointer',fontSize:'.95rem',boxShadow:'0 6px 20px rgba(196,98,45,.3)'}}>Continue</button>
              :<button onClick={submit} disabled={busy} style={{flex:2,padding:'14px',border:'none',borderRadius:12,background:busy?'var(--borderl)':'var(--t)',color:'#fff',fontWeight:700,cursor:busy?'not-allowed':'pointer',fontSize:'.95rem'}}>
                {busy?'Setting up...':'Start Free Trial'}
              </button>
            }
          </div>
          {step===1&&<p style={{textAlign:'center',marginTop:20,fontSize:'.82rem',color:'var(--tlt)'}}>Already have an account? <span onClick={()=>router.push('/auth')} style={{color:'var(--t)',fontWeight:600,cursor:'pointer'}}>Sign in</span></p>}
        </div>
      </div>
    </div>
  );
}
