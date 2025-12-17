import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import PostList from "../components/PostList";

// Site configuration - customize this for your site
const siteConfig = {
  name: 'Pond Narongrit',
  title: "Real-time Site with Convex",
  // Optional logo/header image (place in public/images/, set to null to hide)
  logo: "/images/logo.svg" as string | null,
  intro: (
    <>
      สวัสดีครับ ผมชื่อปอนด์ — ปัจจุบันเป็น Lead Product Designer อยู่ที่ Health at Home
    </>
  ),
  bio: `ที่นี่คุณจะได้พบกับงานเขียนเกี่ยวกับสิ่งต่างๆที่ผมกำลังสนใจหรือได้เรียนรู้ เช่น การออกแบบ, ปรัชญา, ปัญญาประดิษฐ์ และปัญหาชีวิต (รวมถึงเรื่องยากๆเพื่อโบยตีสมองตัวเอง) ซึ่งทั้งหมดถูกเขียนขึ้นโดยมนุษย์ผู้ที่มีอาการตกวงเล็บปิด และชอบเปลี่ยนความหมกหมุ่นไปเรื่อยๆ`,
  featuredEssays: [
    { title: "Setup Guide", slug: "setup-guide" },
    { title: "How to Publish", slug: "how-to-publish" },
    { title: "About This Site", slug: "about-this-blog" },
  ],
  // Links for footer section
  links: {
    docs: "/setup-guide",
    convex: "https://convex.dev",
    netlify: "https://netlify.com",
  },
};

export default function Home() {
  // Fetch published posts from Convex
  const posts = useQuery(api.posts.getAllPosts);

  return (
    <div className="home">
      {/* Header section with intro */}
      <header className="home-header">
        {/* Optional site logo */}
        {siteConfig.logo && (
          <img
            src={siteConfig.logo}
            alt={siteConfig.name}
            className="home-logo"
          />
        )}
        <h1 className="home-name">{siteConfig.name}</h1>

        <p className="home-intro">{siteConfig.intro}</p>

        <p className="home-bio">{siteConfig.bio}</p>

        {/* Featured essays section */}
        <div className="home-featured">
          <p className="home-featured-intro">Get started:</p>
          <ul className="home-featured-list">
            {siteConfig.featuredEssays.map((essay) => (
              <li key={essay.slug}>
                <a href={`/${essay.slug}`} className="home-featured-link">
                  {essay.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* Blog posts section - no loading state to avoid flash (Convex syncs instantly) */}
      <section id="posts" className="home-posts">
        {posts === undefined ? null : posts.length === 0 ? (
          <p className="no-posts">No posts yet. Check back soon!</p>
        ) : (
          <PostList posts={posts} />
        )}
      </section>

      {/* Footer section */}
      <section className="home-footer">
        <p className="home-footer-text">
          ขอบคุณที่เข้ามาเยี่ยมชม ไม่ว่าคุณจะตั้งใจหรือหลงทางมาก็ตาม หวังว่าคุณจะพบกับสิ่งที่คุณตามหา หรือไม่ก็ยอมรับว่าคุณได้เสียเวลาไปกับงานเขียนของคนแปลกหน้าบนอินเทอร์เน็ต
        </p>
      </section>
    </div>
  );
}
