import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchPosts() {
      try {
        setLoading(true);
        const redditURL = "https://www.reddit.com/r/reactjs.json";
        const proxyURL = `https://api.allorigins.win/get?url=${encodeURIComponent(
          redditURL
        )}`;

        const res = await fetch(redditURL, { mode: "cors" }).catch(() =>
          fetch(proxyURL)
        );

        const json = res.url.includes("allorigins")
          ? JSON.parse((await res.json()).contents)
          : await res.json();

        const items = (json?.data?.children || []).map((c) => ({
          id: c?.data?.id || Math.random().toString(36).slice(2, 9),
          title: c?.data?.title || "Untitled Post",
          selftext_html: c?.data?.selftext_html || "",
          url: c?.data?.url || "",
          score: c?.data?.score ?? 0,
          thumbnail:
            c?.data?.thumbnail && c.data.thumbnail.startsWith("http")
              ? c.data.thumbnail
              : null,
        }));

        if (mounted) setPosts(items);
      } catch (err) {
        console.error("Fetch error:", err);
        if (mounted) setPosts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchPosts();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="app-root">
      <main className="container">
        <header className="header">
          <h1 className="title">r/reactjs — Latest Posts</h1>
          <p className="subtitle">
            Live feed from <code>https://www.reddit.com/r/reactjs.json</code>
          </p>
        </header>

        <section className="controls">
          <div className="meta">
            <strong>{posts.length}</strong> posts loaded
          </div>
        </section>

        {loading ? (
          <div className="loading">Fetching latest posts...</div>
        ) : (
          <section className="grid">
            {posts.map((p) => (
              <article className="card" key={p.id}>
                <div className="card-head">
                  <h3 className="card-title">{p.title}</h3>
                  <div className="score">▲ {p.score}</div>
                </div>

                {p.thumbnail && (
                  <img src={p.thumbnail} alt="thumb" className="thumb" />
                )}

                <div
                  className="selftext"
                  dangerouslySetInnerHTML={{
                    __html: p.selftext_html || "<i>No description</i>",
                  }}
                />

                <div className="card-footer">
                  <a
                    className="link"
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open on Reddit
                  </a>
                </div>
              </article>
            ))}
          </section>
        )}

        <footer className="footer">
          Built using React — responsive, gradient-styled layout.
        </footer>
      </main>
    </div>
  );
}
