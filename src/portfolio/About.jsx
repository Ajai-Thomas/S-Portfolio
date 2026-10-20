import Img from './Img';

export default function About({ about }) {
  return (
    <section id="about" className="pf-section" aria-labelledby="about-title">
      <div className="pf-wrap">
        <p className="pf-mono pf-reveal">ABOUT · THE PHOTOGRAPHER</p>
        <h2 id="about-title" className="pf-head__title">
          <span className="pf-reveal pf-mask"><span>{about.heading}</span></span>
        </h2>

        <div className="pf-about">
          <figure className="pf-portrait pf-reveal">
            <Img photo={about.portrait} seed={9} w={800} h={1000} sizes="(min-width: 900px) 30vw, 80vw" />
            <figcaption className="pf-mono">PORTRAIT · {about.portrait?.src ? '' : 'PLACEHOLDER'}</figcaption>
          </figure>
          <div className="pf-bio pf-reveal">
            {about.bio.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>

        <h3 className="pf-sub pf-mono pf-reveal">TIMELINE</h3>
        <ol className="pf-timeline">
          {about.timeline.map((t, i) => (
            <li key={i} className="pf-reveal" style={{ '--d': `${i * 80}ms` }}>
              <span className="pf-timeline__year">{t.year}</span>
              <div>
                <span className="pf-mono pf-tag">{t.type}</span>
                <strong>{t.title}</strong>
                <span className="pf-muted">{t.place}</span>
              </div>
            </li>
          ))}
        </ol>

        <h3 className="pf-sub pf-mono pf-reveal">GEAR</h3>
        <div className="pf-gear">
          {about.gear.map((g, i) => (
            <article key={g.category} className="pf-spec pf-reveal" style={{ '--d': `${i * 100}ms` }}>
              <h4 className="pf-mono">{g.category}</h4>
              <ul>
                {g.items.map((it) => (
                  <li key={it.name}><strong>{it.name}</strong><span className="pf-mono">{it.spec}</span></li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
