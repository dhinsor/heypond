import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "./components/Layout";

const Home = lazy(() => import("./pages/Home"));
const Post = lazy(() => import("./pages/Post"));
const Blog = lazy(() => import("./pages/Blog"));

const PageLoader = () => (
  <div className="flex h-[50vh] w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/:slug" element={<Post />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;

