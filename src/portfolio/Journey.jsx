// Scroll-driven timeline over the zoomed-in 3D camera. Entry opacity/position
// is pure CSS from --about (0–1, set by useScrollFlow), so it costs no React renders.
export default function Journey({ about }) {
  const n = about.timeline.length;
  return (
    <section id="about" className="pf-journey" style={{ '--n': n }} aria-labelledby="about-title">
      <div className="pf-journey__stick">
        <header className="pf-journey__head">
          <p className="pf-mono">THE JOURNEY</p>
          <h2 id="about-title">{about.heading}</h2>
        </header>

        <div className="pf-journey__rail" aria-hidden="true">
          <span className="pf-journey__fill" />
        </div>

        <ol className="pf-journey__list">
          {about.timeline.map((t, i) => (
            <li key={i} style={{ '--i': i }}>
              <span className="pf-journey__dot" aria-hidden="true" />
              <p className="pf-mono pf-journey__range">{t.range} · {t.kind}</p>
              <h3>{t.title}</h3>
              <p className="pf-muted pf-journey__place">{t.place}</p>
              <ul>{t.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
