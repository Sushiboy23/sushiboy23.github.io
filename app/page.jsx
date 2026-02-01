import Link from "next/link";

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <div className="wrap">
      <header className="header">
        <div className="brand">
          <div className="logo" aria-hidden="true" />
          <div>
            <h1 className="name">Zac Kwek</h1>
            <p className="kicker">Software Engineering Student · Developer</p>
          </div>
        </div>

        <nav className="nav">
          <Link href="/#projects">Projects</Link>
          <Link href="/#skills">Skills</Link>
          <Link href="/#about">About</Link>
          <Link href="/#contact">Contact</Link>
          <Link href="/sushi">Sushi</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="card">
          <div className="pill">
            <span className="dot" /> Open to 2026 grad roles
          </div>

          <h2 className="title">I build practical apps, tidy UIs, and APIs that ship.</h2>

          <p className="sub">
            I’m a Monash student focused on software + integration work. This site showcases my projects,
            skills, and how to reach me.
          </p>

          <div className="cta">
            <Link className="btn primary" href="/#projects">See projects</Link>
            <Link className="btn" href="/#contact">Contact</Link>
          </div>
        </div>

        <div className="card">
          <p className="kicker">Quick facts</p>
          <ul className="list">
            <li>📱 iOS: UIKit, Firebase</li>
            <li>🗃️ Databases: Cassandra, MongoDB, Neo4j</li>
            <li>🔁 Integration: APIs, testing, automation</li>
            <li>🎾 Built RacquetSwap marketplace</li>
          </ul>
        </div>
      </section>

      <section id="projects" className="section">
        <h3 className="sectionTitle">Projects</h3>

        <div className="grid">
          <article className="card project">
            <p className="tag">iOS · Swift · Firebase</p>
            <h4>RacquetSwap</h4>
            <p>A tennis racquet marketplace with Explore, Wishlist, and Sell List flows.</p>
          </article>

          <article className="card project">
            <p className="tag">Python · Neo4j</p>
            <h4>Airbnb Graph Analytics</h4>
            <p>Cypher queries for neighbourhood insights and distance-based recommendations.</p>
          </article>

          <article className="card project">
            <p className="tag">MuleSoft · MUnit</p>
            <h4>API Testing & Mocking</h4>
            <p>Mock services and automated tests to improve reliability and speed up development.</p>
          </article>
        </div>
      </section>

      <section id="skills" className="section">
        <h3 className="sectionTitle">Skills</h3>
        <div className="chips">
          {["TypeScript", "React/Next.js", "Swift (UIKit)", "Firebase", "Docker", "Neo4j", "Cassandra", "Git"].map(
            (s) => (
              <span className="chip" key={s}>{s}</span>
            )
          )}
        </div>
      </section>

      <section id="about" className="section">
        <h3 className="sectionTitle">About</h3>
        <div className="card">
          <p>
            Hi, I’m Zac a Business and IT student at Monash University, graduating in May 2026.
            I’m interested in software development and Finance. I enjoy working on projects that turn ideas into usable, real-world applications.
          </p>
        </div>
      </section>

      <section id="contact" className="section">
        <h3 className="sectionTitle">Contact</h3>
        <div className="card">
          <p>
            Email:{" "}
            <a href="mailto:zkwe0001@student.monash.edu">zkwe0001@student.monash.edu</a>
            {" · "}
            GitHub: <a href="#">add-your-link</a>
            {" · "}
            LinkedIn: <a href="#">add-your-link</a>
          </p>
        </div>
      </section>

      <footer className="footer">© {year} Zac Kwek</footer>
    </div>
  );
}
