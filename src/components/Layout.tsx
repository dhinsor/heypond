import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ThemeToggle from "./ThemeToggle";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Fetch published pages for navigation
  const pages = useQuery(api.pages.getAllPages);

  return (
    <div className="layout">
      {/* Top navigation bar with page links and theme toggle */}
      <div
        className="top-nav"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '64px'
        }}
      >
        {/* Page navigation links (optional pages like About, Projects, Contact) */}
        <nav className="page-nav" style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <Link to="/" className="page-nav-link">
            Home
          </Link>

          <Link to="/blog" className="page-nav-link">
            Blog
          </Link>

          {/* Other dynamic pages */}
          {pages && pages
            .filter((page) => page.slug !== "/" && page.slug !== "home")
            .map((page) => (
              <Link
                key={page.slug}
                to={page.slug.startsWith("/") ? page.slug : `/${page.slug}`}
                className="page-nav-link"
              >
                {page.navTitle || page.title}
              </Link>
            ))}
        </nav>
        {/* Theme toggle */}
        <div
          className="theme-toggle-container"
          style={{
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ThemeToggle />
        </div>
      </div>
      <main className="main-content">{children}</main>
    </div>
  );
}
