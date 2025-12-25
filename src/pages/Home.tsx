// import { useQuery } from "convex/react";
// import { api } from "../../convex/_generated/api";
// import PostList from "../components/PostList";
import Footer from "../components/Footer";

// Site configuration - customize this for your site
const siteConfig = {
  name: 'Pond Narongrit',
  title: "Real-time Site with Convex",
  // Optional logo/header image (place in public/images/, set to null to hide)
  logo: "/images/profile-image.jpg",
  intro: (
    <>
      สวัสดีครับ ผมชื่อปอนด์ — ตอนนี้เป็น Lead Product Designer อยู่ที่ <a href="https://healthathome.in.th/">Health at Home</a>
    </>
  ),
  bio: `ที่นี่เปรียบเสมือน Digital Gerden ของผม ซึ่งคุณจะได้พบกับงานเขียนเกี่ยวกับสิ่งต่างๆที่ผมสนใจ ส่วนใหญ่จะเกี่ยวกับ Design, AI, Technology, Philosophy และอะไรก็ตามที่อยู่ระหว่างนั้น`,
  featuredEssays: [
    { title: "เกี่ยวกับผมแบบย่อ", slug: "about" },
    { title: "ว่าด้วยการเป็นนักออกแบบ UX ที่ดี", slug: "on-good-ux-designer" },
    { title: "อยู่อย่างออฟไลน์", slug: "offline-living" },
    { title: "Complexity ซับซ้อนได้แต่ต้องไม่สับสน", slug: "the-beginning-of-heirloom" },
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
  // const posts = useQuery(api.posts.getAllPosts);

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
          <p className="home-featured-intro">งานเขียนแนะนำ</p>
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
        {/* <p className="home-intro"><a href="/blog">งานเขียนทั้งหมด</a></p> */}
        <p className="home-intro">หากต้องการพูดคุยหรือมีข้อเสนอแนะใดๆ สามารถเมลมาที่ <a href="mailto:pond@hey.com">pond@hey.com</a> ได้เลยนะครับ</p>
      </header>

      {/* Blog posts section moved to /blog */}

      {/* Footer section */}
      <Footer />
    </div>
  );
}
