import Link from "next/link";

export default function Home() {
  const year = new Date().getFullYear();

  const featured = [
    {
      title: "RacquetSwap",
      tag: "iOS · Swift · Firebase",
      desc:
        "A tennis racquet marketplace app with Explore, Wishlist, and Sell List flows. Built with UIKit and Firebase (Auth + Firestore), focusing on clean UI, user-first navigation, and realistic marketplace features.",
      highlights: [
        "UIKit UI flows (Explore, Wishlist, Sell List)",
        "Firebase Auth + Firestore data model",
        "Reusable components + clean structure",
      ],
      tech: ["Swift", "UIKit", "Firebase Auth", "Firestore"],
      image: "racquetswap.png"
    },
    {
      title: "Finance AI Chatbot",
      tag: "Python · LLMs · Embeddings",
      desc:
        "A finance-focused chatbot that uses a hosted LLM API plus embeddings for retrieval. Includes conversation memory controls and clear disclaimers to keep outputs safe and user-friendly.",
      highlights: [
        "Retrieval via embeddings (vector search)",
        "Memory controls + chat history budget",
        "Safety disclaimers and guarded responses",
      ],
      tech: ["Python", "LLM API", "Embeddings", "RAG"],
      image: "financechatbot1.png"
    },
    {
      title: "API Testing & Mocking",
      tag: "MuleSoft · MUnit",
      desc:
        "Built mock services and automated tests to improve reliability and speed up integration development. Focused on test coverage, maintainable mocks, and repeatable test cases.",
      highlights: [
        "Automated tests with MUnit",
        "Mock API responses for stable testing",
        "Improved reliability + faster dev cycle",
      ],
      tech: ["MuleSoft", "MUnit", "Mocking", "Testing"],
      image: "mulesoft1.png"
    },
  ];

  const skills = [
    "JavaScript",
    "React / Next.js",
    "Swift (UIKit)",
    "Firebase (Auth, Firestore)",
    "SQL",
    "Git / GitHub",
    "Python",
    "LLMs / Embeddings",
    "Cassandra",
    "MuleSoft"
  ];

  return (
    <div className="wrap">
      <header className="header">
        <div className="brand">
          <div className="logo" aria-hidden="true" />
          <div>
            <h1 className="name">Zac Kwek</h1>
            <p className="kicker">Business & IT Student</p>
          </div>
        </div>

        <nav className="nav">
          <Link href="/#projects">Projects</Link>
          <Link href="/#skills">Skills</Link>
          <Link href="/#about">About</Link>
          <Link href="/#contact">Contact</Link>
          <Link href="/sushi-knight">Sushi Knight Fantasy</Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="card">
          <h2 className="title">Software Development & Financial Analysis</h2>

          <p className="sub">
            I’m Zac — a Business & IT student at Monash University graduating in May 2026.
            I’m interested in software development & finance, and I enjoy building projects
            that provide real world benefits.
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
        <div className="card heroPhotoCard">
          <img
            src="/japanzac.jpeg"
            alt="Zac Kwek photo"
            className="heroPhoto"
          />
        </div>
      </section>

      {/* PROJECTS (featured only) */}
      <section id="projects" className="section">
        <h3 className="sectionTitle">Projects</h3>

        <div className="featuredWrap">
          {featured.map((p, idx) => {
            const reverse = idx % 2 === 1;

            return (
              <div className="card featuredCard" key={p.title}>
                <div className={`featuredRow ${reverse ? "reverse" : ""}`}>
                  {/* Text */}
                  <div className="featuredContent">
                    <p className="tag">{p.tag}</p>
                    <h4 className="featuredTitle">{p.title}</h4>
                    <p className="featuredDesc">{p.desc}</p>

                    <ul className="featuredList">
                      {p.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>

                    <div className="pillRow">
                      {p.tech.map((t) => (
                        <span key={t} className="pill">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Visual */}
                  <div className="featuredVisual">
                    <img
                    src={`/projects/${p.image}`}
                    alt={`${p.title} screenshot`}
                    className="projectImage"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SKILLS */}
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

      {/* EXPERIENCE */}
      <section id="experience" className="section">
        <h3 className="sectionTitle">Experience</h3>

        <div className="grid">
          <div className="card project">
            <p className="tag">Integration · APIs · Testing</p>
            <h4>Integration Engineering (Projects)</h4>
            <p>
              Worked on API/integration work including data retrieval and transformation, testing automation, mocking services, and reliability improvements
              for dev environments.
            </p>
          </div>

          <div className="card project">
            <p className="tag">Finance · Analysis</p>
            <h4>Finance Interest & Modelling</h4>
            <p>
              Interested in financial markets and modelling, portfolio valuation and stock / options analysis.
            </p>
          </div>

          <div className="card project">
            <p className="tag">Student · Projects</p>
            <h4>Software Projects</h4>
            <p>
              Built various software applications and tools to deepen my technical understading.
            </p>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="section">
        <h3 className="sectionTitle">About</h3>
        <div className="card">
          <p>
            Hi, I’m Zac a Business & IT student at Monash University majoring in software development and finance, graduating in May 2026. 
            In my free time I enjoy building software projects such as an AI Chatbot that I am very proud about and also manage my own stock portfolio
            where I invest my part-time pay and grow/shrink my portfolio. For non-academic hobbies I enjoy playing tennis and competing as well
            as hanging out with friends or staying in to binge watch netflix. 
            
            Thanks for taking the time to view this page. 
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section">
        <h3 className="sectionTitle">Contact</h3>
        <div className="card">
          <p>
            Email: <a href="mailto:Zenyikwek@gmail.com">Zenyikwek@gmail.com</a>
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
            {" · "}
            Facebook:{" "}
            <a href="https://www.facebook.com/Zackwek629" target="_blank" rel="noreferrer">
              Zac Kwek
            </a>
          </p>
        </div>
      </section>

      <footer className="footer">© {year} Zac Kwek</footer>
    </div>
  );
}
