import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import { createServer } from '@/lib/supabase-server';
import { absoluteUrl, truncateMeta } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const sb = createServer();
  const { data } = await sb.from('profiles').select('full_name,role,city,bio').eq('id', params.id).single();
  if (!data) return { title: 'Designer not found' };
  const role = data.role || 'designer';
  const title = `${data.full_name}${data.city ? ` - ${role} in ${data.city}` : ''}`;
  const description = truncateMeta(data.bio || `${data.full_name} is a verified ${role} on Homeizz${data.city ? ` in ${data.city}` : ''}. View portfolio and request a quote.`);
  return {
    title,
    description,
    alternates: { canonical: `/designer/${params.id}` },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/designer/${params.id}`),
    },
  };
}

export default async function DesignerPage({ params }) {
  const sb = createServer();
  const { data: profile } = await sb.from('profiles').select('*').eq('id', params.id).single();
  if (!profile) notFound();
  const { data: projects } = await sb.from('listings').select('*').eq('owner_id', params.id).eq('status', 'live');

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: profile.full_name,
    url: absoluteUrl(`/designer/${params.id}`),
    address: { '@type': 'PostalAddress', addressLocality: profile.city, addressCountry: 'IN' },
    description: profile.bio,
  };

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <div className="profile-pg">
        <div className="prof-cover">
          <div className="pc-in">
            <div className="pc-av">{(profile.full_name || '?').charAt(0).toUpperCase()}</div>
            <div className="pc-info">
              <h1>{profile.full_name}</h1>
              <div className="pc-meta">
                <span className="pc-m">🎨 {profile.role || 'Designer'}</span>
                {profile.city && <span className="pc-m">📍 {profile.city}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="prof-body">
          <div className="prof-main">
            <div className="ptab-body">
              <p className="about-t">{profile.bio || 'Verified professional on Homeizz.'}</p>
              <h3 style={{ marginTop: 24 }}>Projects ({projects?.length || 0})</h3>
              <div className="proj-grid">
                {(projects || []).map(p => (
                  <div key={p.id} className="pj-card">
                    <div className="pj-thumb" style={{ background: '#F5DDD0' }}>🏠</div>
                    <div className="pj-info">
                      <h4>{p.title}</h4>
                      <div className="pj-meta">📍 {p.city}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
