import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import PostList from "../components/PostList";
import Footer from "../components/Footer";

export default function Blog() {
    const posts = useQuery(api.posts.getAllPosts);

    return (
        <div className="blog-page">
            <h1 className="page-title">Blog</h1>
            <p className="home-intro">งานเขียนต่างๆที่ผมรู้สึกว่าดีพอที่จะเผยแพร่หรือไม่เขินอายที่จะให้คนอื่นอ่าน โดยพยายามอัปเดตทุกสัปดาห์</p>
            <section className="home-posts">
                {posts === undefined ? null : posts.length === 0 ? (
                    <p className="no-posts">ยังไม่มีบทความที่นี่ ไว้กลับมาใหม่อีกครั้งนะ!</p>
                ) : (
                    <PostList posts={posts} />
                )}
            </section>
            <Footer />
        </div>
    );
}
