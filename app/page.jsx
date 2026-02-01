import Link from "next/link";

export default function Home() {
  const year = new Date().getFullYear();

  const projects = [
    {
      title: "RacquetSwap",
      tag: "iOS · Swift · Firebase",
      desc:
        "A tennis racquet marketplace app with Explore, Wishlist, and Sell List features. Built with UIKit and Firebase Auth/Firestore, focusing on clean UI and real-world app flows.",
      link: "#",
    },
    {
      title: "Airbnb Graph Analytics",
      tag: "Python · Neo4j · Cypher",
      desc:
        "Graph analytics tasks using Cypher for neighbourhood insights, distance-based recommendations, and tie-break rule querying. Focused on query-first thinking and data modelling.",
      link: "#",
    },
    {
      title: "Portfolio Website (This Site)",
      tag: "Next.js · React · CSS",
      desc:
        "A personal portfolio built with Next.js and React. Deployed on GitHub Pages with a custom domain, designed to showcase projects, skills, and contact details cleanly.",
      link: "#",
    },
  ];

  const skills = [
    "JavaScript",
    "React / Next.js",
    "Swift (UIKit)",
    "Firebase (Auth, Firestore)",
    "SQL",
    "Git / GitHub",
    "Docker",
    "Neo4j / Cypher",
    "Cassandra",
  ];

  return (
    <div className="wrap">
      <header className="header">
        <div className="brand">
          <div className="logo" aria-hidden="true" />
          <div>
            <h1 className="name">Zac Kwek</h1>
            <p className="kicker">Business & IT Student · Developer</p>
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

      {/* HERO (now 2-column: text on left, photo on right) */}
      <section className="hero">
        <div className="card">
          <h2 className="title">I build practical apps and clean, usable software.</h2>

          <p className="sub">
            I’m Zac — a Business & IT student at Monash University graduating in May 2026.
            I’m interested in software development and finance, and I enjoy building projects
            that turn ideas into real-world applications.
          </p>

          <div className="cta">
            <Link className="btn primary" href="/#projects">
              See projects
            </Link>
            <Link className="btn" href="/#contact">
              Contact
            </Link>
          </div>
        </div>

        {/* Photo card */}
        <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img
            src="/zac.jpg"
            alt="Zac Kwek headshot"
            style={{
              width: 180,
              height: 180,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.10)",
              objectFit: "cover",
            }}
          />
        </div>
      </section>

      <section id="projects" className="section">
        <h3 className="sectionTitle">Projects</h3>

        <div className="grid">
          {projects.map((p) => (
            <article className="card project" key={p.title}>
              <p className="tag">{p.tag}</p>
              <h4>{p.title}</h4>
              <p>{p.desc}</p>

              {p.link !== "#" && (
                <p style={{ marginTop: 10 }}>
                  <a href={p.link} target="_blank" rel="noreferrer">
                    View project →
                  </a>
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section id="skills" className="section">
        <h3 className="sectionTitle">Skills</h3>
        <div className="chips">
          {skills.map((s) => (
            <span className="chip" key={s}>
              {s}
            </span>
          ))}
        </div>
      </section>

      <section id="about" className="section">
        <h3 className="sectionTitle">About</h3>
        <div className="card">
          <p>
            Hi, I’m Zac — a Business & IT student at Monash University graduating in May 2026.
            I enjoy building clean, user-friendly applications across web and iOS, and I like working
            on projects that combine solid backend logic with tidy front-end UI. I’m especially interested
            in software development, integration, and finance-related problem solving.
          </p>
        </div>
      </section>

      <section id="contact" className="section">
        <h3 className="sectionTitle">Contact</h3>
        <div className="card">
          <p>
            Email:{" "}
            <a href="mailto:Zenyikwek@gmail.com">Zenyikwek@gmail.com</a>
            {" · "}
            GitHub:{" "}
            <a href="https://github.com/Sushiboy23" target="_blank" rel="noreferrer">
              github.com/Sushiboy23
            </a>
            {" · "}
            LinkedIn:{" "}
            <a href="https://www.linkedin.com/in/zac-kwek/" target="_blank" rel="noreferrer">
              linkedin.com/in/zac-kwek
            </a>
          </p>
        </div>
      </section>

      <footer className="footer">© {year} Zac Kwek</footer>
    </div>
  );
}
