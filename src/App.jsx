import { useEffect, useState } from "react";
import "./App.css";

const Posts_per_page = 10;

function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://www.reddit.com/r/reactjs.json");
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setPosts(data?.data?.children || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load Reddit posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const htmlToPlainText = (html) => {
    if (!html) return "";
    const textarea = document.createElement("textarea");
    textarea.innerHTML = html;
    let decoded = textarea.value;

    decoded = decoded.replace(/<br\s*\/?>/gi, "\n");
    decoded = decoded.replace(/<\/p>/gi, "\n\n");

    const div = document.createElement("div");
    div.innerHTML = decoded;

    const plain = div.textContent || div.innerText || "";
    return plain.trim();
  };

  const totalPosts = posts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / Posts_per_page));
  const startIndex = (currentPage - 1) * Posts_per_page;
  const endIndex = startIndex + Posts_per_page;
  const visiblePosts = posts.slice(startIndex, endIndex);

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return <p className="loading">Loading posts...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="container">
      <h1 className="heading">React.js Posts</h1>

      <div className="list">
        {visiblePosts.map((item) => {
          const post = item.data;
          const plain = htmlToPlainText(post.selftext_html);

          return (
            <article key={post.id} className="card">
              <div className="card-left">
                <h2 className="title">{post.title}</h2>
                {plain ? (
                  <div className="content" aria-label="post text">
                    {plain}
                  </div>
                ) : (
                  <div className="content empty">No text content</div>
                )}

                <div className="card-actions">
                  <a
                    href={`https://reddit.com${post.permalink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    View on Reddit
                  </a>

                  <p className="score">Score: {post.score}</p>
                </div>
              </div>
            </article>
          );
        })}

        {!visiblePosts.length && (
          <p className="no-posts">No posts to display.</p>
        )}
      </div>

      <nav className="pagination" aria-label="Pagination">
        <button
          className="page-btn"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          « Previous
        </button>

        <div className="page-numbers">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`page-number ${
                  pageNum === currentPage ? "active" : ""
                }`}
                aria-current={pageNum === currentPage ? "page" : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          className="page-btn"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next »
        </button>
      </nav>

      <footer className="footer">
        Showing {startIndex + 1}–{Math.min(endIndex, totalPosts)} of{" "}
        {totalPosts} posts
      </footer>
    </div>
  );
}

export default App;
