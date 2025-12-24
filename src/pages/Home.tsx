// import { useQuery } from "convex/react";
// import { api } from "../../convex/_generated/api";
// import PostList from "../components/PostList";
import Footer from "../components/Footer";

// Site configuration - customize this for your site
const siteConfig = {
  name: 'Pond Narongrit',
  title: "Real-time Site with Convex",
  // Optional logo/header image (place in public/images/, set to null to hide)
  logo: null,
  intro: (
    <>
      สวัสดีครับ ผมชื่อปอนด์ — ปัจจุบันเป็น Lead Product Designer อยู่ที่ <a href="https://healthathome.in.th/">Health at Home</a>
    </>
  ),
  bio: `ที่นี่คุณจะได้พบกับงานเขียนเกี่ยวกับสิ่งต่างๆที่ผมกำลังสนใจหรือได้เรียนรู้ ส่วนมากจะเกี่ยวกับการออกแบบ, ปรัชญา, ปัญญาประดิษฐ์ และสิ่งอื่นๆที่อยู่ระหว่างนั้น ซึ่งบรรจงเขียนขึ้นโดยมนุษย์ผู้ที่มักตกวงเล็บปิด และชอบเปลี่ยนความหมกหมุ่นไปเรื่อยๆเพื่อหลีกเลี่ยงอาการหน่ายชีวิต`,
  featuredEssays: [
    { title: "เกี่ยวกับผมแบบพอสังเขป", slug: "about" },
    { title: "ว่าด้วยการเป็นนักออกแบบ UX ที่ดี", slug: "on-good-ux-designer" },
    { title: "อยู่อย่างออฟไลน์", slug: "offline-living" },
    { title: "Heirloom Engineering", slug: "the-beginning-of-heirloom" },
    { title: "ซับซ้อนได้ แต่ต้องไม่สับสน", slug: "the-beginning-of-heirloom" },
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
        <p className="home-intro">หากต้องการพูดคุยหรือมีข้อเสนอแนะใดๆ สามารถติดต่อมาได้ที่ pond@hey.com หรือ<a href="/contact">ช่องทางอื่น</a>ตามความสะดวกได้เลย (โอกาสตอบกลับอาจน้อยกว่าอีเมล)</p>
      </header>

      {/* Blog posts section moved to /blog */}

      {/* Footer section */}
      <Footer />
    </div>
  );
}
