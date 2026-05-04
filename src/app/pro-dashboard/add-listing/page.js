'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';

export const dynamic = 'force-dynamic';

const CITIES = [
  'Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Pune','Kolkata',
  'Ahmedabad','Jaipur','Surat','Lucknow','Nagpur','Indore','Thane',
  'Bhopal','Patna','Vadodara','Ghaziabad','Ludhiana','Agra','Nashik',
  'Faridabad','Meerut','Rajkot','Kochi','Amritsar','Aurangabad','Srinagar'
];

const STYLES = [
  'Modern','Minimalist','Traditional','Contemporary','Industrial',
  'Luxury','Budget-friendly','Scandinavian','Bohemian','Art Deco'
];

const PROJECT_TYPES = [
  'Residential','Commercial','Office','Retail','Hospitality','Villa','Apartment','Bungalow'
];

const labelStyle = { display:'block', fontSize:'.82rem', fontWeight:600, color:'var(--b)', marginBottom:6 };
const inputStyle = { width:'100%', padding:'12px 14px', border:'1.5px solid var(--borderl)', borderRadius:10, fontSize:'.9rem', color:'var(--b)', background:'#fff', outline:'none', fontFamily:'var(--fb)' };

function Field({ label, type='text', value, onChange, placeholder, required }) {
  return (
    <div>
      <label style={labelStyle}>{label}{required&&<span style={{color:'var(--t)'}}>*</span>}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} style={inputStyle}/>
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder, required }) {
  return (
    <div>
      <label style={labelStyle}>{label}{required&&<span style={{color:'var(--t)'}}>*</span>}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{...inputStyle,cursor:'pointer'}}>
        <option value="">{placeholder||'Select an option'}</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function AddListing() {
  const sb = createClient();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [listingType, setListingType] = useState('');
  const [city, setCity] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [sqft, setSqft] = useState('');
  const [style, setStyle] = useState('');
  const [projectType, setProjectType] = useState('');
  const [tags, setTags] = useState('');
  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth'); return; }
      if (data.user.user_metadata?.role !== 'professional') { router.push('/'); return; }
      setUser(data.user);
    });
  }, []);

  const MAX_BYTES = 10 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp'];

  function getExt(name) {
    const i = (name || '').lastIndexOf('.');
    return i > 0 ? name.slice(i + 1).toLowerCase() : '';
  }

  function validateImage(file) {
    if (!file) return 'No file selected';
    if (file.size > MAX_BYTES) return `${file.name}: file is larger than 10MB`;
    const type = (file.type || '').toLowerCase();
    if (!ALLOWED_TYPES.includes(type)) return `${file.name}: only JPG, PNG, or WebP allowed`;
    const ext = getExt(file.name);
    if (!ALLOWED_EXTS.includes(ext)) return `${file.name}: file extension must be jpg, png, or webp`;
    return null;
  }

  function handleCoverImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const problem = validateImage(file);
    if (problem) { setErr(problem); e.target.value = ''; return; }
    setErr('');
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function handlePhotos(e) {
    const incoming = [...e.target.files];
    const accepted = [];
    let firstProblem = null;
    for (const f of incoming) {
      const problem = validateImage(f);
      if (problem) { firstProblem = firstProblem || problem; continue; }
      accepted.push(f);
    }
    if (firstProblem) setErr(firstProblem); else setErr('');
    setPhotos(prev => [...prev, ...accepted].slice(0, 10));
    setPhotoPreviews(prev => [...prev, ...accepted.map(f => URL.createObjectURL(f))].slice(0, 10));
    e.target.value = '';
  }

  function removePhoto(idx) {
    setPhotos(prev => prev.filter((_,i) => i !== idx));
    setPhotoPreviews(prev => prev.filter((_,i) => i !== idx));
  }

  function nextStep() {
    setErr('');
    if (step===1) { if (!title||!description||!listingType||!city) return setErr('Please fill all required fields'); }
    if (step===2) { if (!style||!projectType) return setErr('Please select style and project type'); }
    if (step===3) { if (!priceUnit) return setErr('Please select a price unit'); if (priceUnit!=='on request'&&!price) return setErr('Please enter a price'); }
    setStep(s=>s+1);
  }

  async function submit() {
    if (!coverImage) return setErr('Please upload a cover photo');
    setBusy(true); setErr('');
    try {
      const coverProblem = validateImage(coverImage);
      if (coverProblem) throw new Error(coverProblem);
      for (const p of photos) {
        const photoProblem = validateImage(p);
        if (photoProblem) throw new Error(photoProblem);
      }

      const uid = user.id;
      const timestamp = Date.now();
      const coverExt = getExt(coverImage.name) || 'jpg';
      const coverPath = `${uid}/cover_${timestamp}.${coverExt}`;
      const { error: coverErr } = await sb.storage.from('listings').upload(coverPath, coverImage);
      if (coverErr) throw coverErr;
      const { data: coverUrl } = sb.storage.from('listings').getPublicUrl(coverPath);
      let photoUrls = [];
      for (let i=0; i<photos.length; i++) {
        const ext = getExt(photos[i].name) || 'jpg';
        const path = `${uid}/photo_${timestamp}_${i}.${ext}`;
        await sb.storage.from('listings').upload(path, photos[i]);
        const { data: url } = sb.storage.from('listings').getPublicUrl(path);
        photoUrls.push(url.publicUrl);
      }
      const { error: insertErr } = await sb.from('listings').insert({
        owner_id: uid, title, description,
        listing_type: listingType, city,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        sqft: sqft ? parseInt(sqft) : null,
        price_paise: price ? Math.round(parseFloat(price)*100) : 0,
        price_unit: priceUnit,
        cover_image: coverUrl.publicUrl,
        photos: photoUrls,
        tags: tags.split(',').map(t=>t.trim()).filter(Boolean),
        style, project_type: projectType, status: 'live',
      });
      if (insertErr) throw insertErr;
      setSuccess(true);
    } catch(e) {
      setErr(e.message||'Something went wrong. Please try again.');
    } finally { setBusy(false); }
  }

  if (success) return (
    <div style={{minHeight:'100vh',background:'var(--c)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'#fff',borderRadius:20,padding:'48px 40px',textAlign:'center',maxWidth:440,border:'1.5px solid var(--borderl)',boxShadow:'var(--shm)'}}>
        <div style={{fontSize:'4rem',marginBottom:16}}>🎉</div>
        <h2 style={{fontFamily:'var(--fd)',color:'var(--b)',marginBottom:8}}>Listing Published!</h2>
        <p style={{color:'var(--tlt)',fontSize:'.9rem',marginBottom:28}}>Your listing is now live on Homeizz. Homeowners can discover and contact you!</p>
        <div style={{display:'flex',gap:12,justifyContent:'center'}}>
          <button onClick={()=>router.push('/pro-dashboard')} style={{padding:'12px 24px',background:'var(--t)',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer'}}>Go to Dashboard</button>
          <button onClick={()=>{setSuccess(false);setStep(1);setTitle('');setDescription('');setListingType('');setCity('');setStyle('');setProjectType('');setPrice('');setPriceUnit('');setCoverImage(null);setCoverPreview('');setPhotos([]);setPhotoPreviews([]);}} style={{padding:'12px 24px',background:'transparent',color:'var(--t)',border:'2px solid var(--t)',borderRadius:10,fontWeight:700,cursor:'pointer'}}>Add Another</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#F5F0EB'}}>
      <div style={{background:'var(--b)',padding:'0 32px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',position:'fixed',top:0,left:0,right:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <button onClick={()=>router.push('/pro-dashboard')} style={{background:'rgba(255,255,255,.1)',border:'none',color:'rgba(255,255,255,.7)',padding:'8px 14px',borderRadius:8,cursor:'pointer',fontSize:'.82rem'}}>← Back</button>
          <div style={{fontFamily:'var(--fd)',color:'#fff',fontSize:'1.1rem',fontWeight:600}}>Add New Listing</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          {[1,2,3,4].map(s=>(
            <div key={s} style={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:step>=s?'var(--t)':'rgba(255,255,255,.15)',color:'#fff',fontSize:'.75rem',fontWeight:700}}>
              {step>s?'✓':s}
            </div>
          ))}
        </div>
      </div>

      <div style={{paddingTop:96,maxWidth:680,margin:'0 auto',padding:'96px 20px 80px'}}>
        {err&&<div style={{background:'#FEF2F2',border:'1px solid #FECACA',color:'#DC2626',borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:'.875rem'}}>{err}</div>}

        <div style={{background:'#fff',borderRadius:20,padding:'36px 40px',border:'1.5px solid var(--borderl)',boxShadow:'var(--sh)'}}>

          {step===1&&(
            <div>
              <h2 style={{fontFamily:'var(--fd)',marginBottom:6,color:'var(--b)'}}>Basic Information</h2>
              <p style={{color:'var(--tlt)',fontSize:'.88rem',marginBottom:28}}>Tell homeowners about this project</p>
              <div style={{display:'flex',flexDirection:'column',gap:18}}>
                <Field label="Listing Title" required value={title} onChange={setTitle} placeholder="e.g. Modern 3BHK Interior — Bangalore"/>
                <div>
                  <label style={labelStyle}>Description <span style={{color:'var(--t)'}}>*</span></label>
                  <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Describe this project..." style={{...inputStyle,height:120,resize:'vertical'}}/>
                </div>
                <div>
                  <label style={labelStyle}>Listing Type <span style={{color:'var(--t)'}}>*</span></label>
                  <div style={{display:'flex',gap:10}}>
                    {[{id:'interior',icon:'🛋️',label:'Interior Design'},{id:'architecture',icon:'🏛️',label:'Architecture'},{id:'plan',icon:'📐',label:'Home Plan'}].map(t=>(
                      <div key={t.id} onClick={()=>setListingType(t.id)} style={{flex:1,border:`2px solid ${listingType===t.id?'var(--t)':'var(--borderl)'}`,borderRadius:12,padding:'14px 10px',cursor:'pointer',textAlign:'center',background:listingType===t.id?'var(--tpp)':'#fff',transition:'all .2s'}}>
                        <div style={{fontSize:'1.5rem',marginBottom:6}}>{t.icon}</div>
                        <div style={{fontSize:'.78rem',fontWeight:600,color:listingType===t.id?'var(--t)':'var(--b)'}}>{t.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <SelectField label="City" required value={city} onChange={setCity} options={CITIES} placeholder="Select city"/>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                  <SelectField label="Bedrooms" value={bedrooms} onChange={setBedrooms} options={['1 BHK','2 BHK','3 BHK','4 BHK','5 BHK','5+ BHK','Studio','Villa']}/>
                  <Field label="Area (sq ft)" type="number" value={sqft} onChange={setSqft} placeholder="e.g. 1200"/>
                </div>
              </div>
            </div>
          )}

          {step===2&&(
            <div>
              <h2 style={{fontFamily:'var(--fd)',marginBottom:6,color:'var(--b)'}}>Style & Project Type</h2>
              <p style={{color:'var(--tlt)',fontSize:'.88rem',marginBottom:28}}>Help homeowners find you through search</p>
              <div style={{display:'flex',flexDirection:'column',gap:24}}>
                <div>
                  <label style={labelStyle}>Design Style <span style={{color:'var(--t)'}}>*</span></label>
                  <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
                    {STYLES.map(s=>(
                      <div key={s} onClick={()=>setStyle(s)} style={{padding:'8px 16px',borderRadius:50,border:`1.5px solid ${style===s?'var(--t)':'var(--borderl)'}`,background:style===s?'var(--tpp)':'#fff',color:style===s?'var(--t)':'var(--tm)',fontSize:'.85rem',fontWeight:500,cursor:'pointer'}}>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Project Type <span style={{color:'var(--t)'}}>*</span></label>
                  <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
                    {PROJECT_TYPES.map(t=>(
                      <div key={t} onClick={()=>setProjectType(t)} style={{padding:'8px 16px',borderRadius:50,border:`1.5px solid ${projectType===t?'var(--t)':'var(--borderl)'}`,background:projectType===t?'var(--tpp)':'#fff',color:projectType===t?'var(--t)':'var(--tm)',fontSize:'.85rem',fontWeight:500,cursor:'pointer'}}>
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Tags (comma separated)</label>
                  <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="e.g. false ceiling, modular kitchen, wooden flooring" style={inputStyle}/>
                  <p style={{fontSize:'.75rem',color:'var(--tlt)',marginTop:6}}>Tags help homeowners find your listing</p>
                </div>
              </div>
            </div>
          )}

          {step===3&&(
            <div>
              <h2 style={{fontFamily:'var(--fd)',marginBottom:6,color:'var(--b)'}}>Pricing</h2>
              <p style={{color:'var(--tlt)',fontSize:'.88rem',marginBottom:28}}>Set your pricing for this project</p>
              <div style={{display:'flex',flexDirection:'column',gap:18}}>
                <div>
                  <label style={labelStyle}>Price Unit <span style={{color:'var(--t)'}}>*</span></label>
                  <div style={{display:'flex',gap:10}}>
                    {[{id:'per sqft',label:'Per Sq Ft',icon:'📐'},{id:'total project',label:'Total Project',icon:'🏠'},{id:'on request',label:'On Request',icon:'💬'}].map(u=>(
                      <div key={u.id} onClick={()=>setPriceUnit(u.id)} style={{flex:1,border:`2px solid ${priceUnit===u.id?'var(--t)':'var(--borderl)'}`,borderRadius:12,padding:'14px 10px',cursor:'pointer',textAlign:'center',background:priceUnit===u.id?'var(--tpp)':'#fff',transition:'all .2s'}}>
                        <div style={{fontSize:'1.3rem',marginBottom:4}}>{u.icon}</div>
                        <div style={{fontSize:'.78rem',fontWeight:600,color:priceUnit===u.id?'var(--t)':'var(--b)'}}>{u.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {priceUnit&&priceUnit!=='on request'&&(
                  <div>
                    <label style={labelStyle}>Price (₹) <span style={{color:'var(--t)'}}>*</span></label>
                    <div style={{position:'relative'}}>
                      <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--tlt)',fontWeight:600}}>₹</span>
                      <input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder={priceUnit==='per sqft'?'e.g. 1500':'e.g. 500000'} style={{...inputStyle,paddingLeft:30}}/>
                    </div>
                  </div>
                )}
                {price&&priceUnit!=='on request'&&(
                  <div style={{background:'var(--c)',borderRadius:12,padding:'16px 20px',border:'1.5px solid var(--borderl)'}}>
                    <div style={{fontSize:'.78rem',fontWeight:700,color:'var(--tlt)',textTransform:'uppercase',marginBottom:6}}>Preview</div>
                    <div style={{fontFamily:'var(--fd)',fontSize:'1.5rem',color:'var(--t)',fontWeight:700}}>₹{parseInt(price).toLocaleString()} {priceUnit}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step===4&&(
            <div>
              <h2 style={{fontFamily:'var(--fd)',marginBottom:6,color:'var(--b)'}}>Project Photos</h2>
              <p style={{color:'var(--tlt)',fontSize:'.88rem',marginBottom:28}}>Great photos = more enquiries!</p>
              <div style={{display:'flex',flexDirection:'column',gap:20}}>
                <div>
                  <label style={labelStyle}>Cover Photo <span style={{color:'var(--t)'}}>*</span></label>
                  <p style={{fontSize:'.75rem',color:'var(--tlt)',marginBottom:10}}>First photo homeowners see — make it count!</p>
                  {coverPreview?(
                    <div style={{position:'relative'}}>
                      <img src={coverPreview} alt="Cover" style={{width:'100%',height:200,objectFit:'cover',borderRadius:12,border:'1.5px solid var(--borderl)'}}/>
                      <button onClick={()=>{setCoverImage(null);setCoverPreview('');}} style={{position:'absolute',top:8,right:8,background:'rgba(0,0,0,.6)',color:'#fff',border:'none',borderRadius:'50%',width:28,height:28,cursor:'pointer',fontSize:'1rem'}}>×</button>
                    </div>
                  ):(
                    <label style={{display:'block',border:'2px dashed var(--borderl)',borderRadius:12,padding:'32px',textAlign:'center',cursor:'pointer',background:'var(--c)'}}>
                      <div style={{fontSize:'2.5rem',marginBottom:8}}>📸</div>
                      <div style={{fontWeight:600,color:'var(--b)',marginBottom:4}}>Click to upload cover photo</div>
                      <div style={{fontSize:'.75rem',color:'var(--tlt)'}}>JPG, PNG — max 10MB</div>
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverImage} style={{display:'none'}}/>
                    </label>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Additional Photos (up to 10)</label>
                  {photoPreviews.length>0&&(
                    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:12}}>
                      {photoPreviews.map((src,i)=>(
                        <div key={i} style={{position:'relative'}}>
                          <img src={src} alt={`Photo ${i+1}`} style={{width:'100%',height:90,objectFit:'cover',borderRadius:8,border:'1.5px solid var(--borderl)'}}/>
                          <button onClick={()=>removePhoto(i)} style={{position:'absolute',top:4,right:4,background:'rgba(0,0,0,.6)',color:'#fff',border:'none',borderRadius:'50%',width:22,height:22,cursor:'pointer',fontSize:'.8rem'}}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {photoPreviews.length<10&&(
                    <label style={{display:'block',border:'2px dashed var(--borderl)',borderRadius:12,padding:'20px',textAlign:'center',cursor:'pointer',background:'var(--c)'}}>
                      <div style={{fontSize:'1.5rem',marginBottom:4}}>➕</div>
                      <div style={{fontSize:'.82rem',fontWeight:600,color:'var(--b)'}}>Add photos ({photoPreviews.length}/10)</div>
                      <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotos} style={{display:'none'}}/>
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          <div style={{display:'flex',gap:12,marginTop:32}}>
            {step>1&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:'14px',border:'2px solid var(--borderl)',borderRadius:12,background:'#fff',color:'var(--tm)',fontWeight:600,cursor:'pointer',fontSize:'.9rem'}}>← Back</button>}
            {step<4
              ?<button onClick={nextStep} style={{flex:2,padding:'14px',border:'none',borderRadius:12,background:'var(--t)',color:'#fff',fontWeight:700,cursor:'pointer',fontSize:'.95rem',boxShadow:'0 6px 20px rgba(196,98,45,.3)'}}>Continue →</button>
              :<button onClick={submit} disabled={busy} style={{flex:2,padding:'14px',border:'none',borderRadius:12,background:busy?'var(--borderl)':'var(--t)',color:'#fff',fontWeight:700,cursor:busy?'not-allowed':'pointer',fontSize:'.95rem'}}>
                {busy?'Publishing...':'🚀 Publish Listing'}
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}