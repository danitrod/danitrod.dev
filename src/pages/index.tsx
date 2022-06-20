import { readdirSync } from 'fs';

import type { GetStaticProps, GetStaticPropsResult, NextPage } from 'next';
import Link from 'next/link';

import { prettyDate } from 'src/utils';
import SEO from '@/components/SEO';
import { PostMetadata } from '@/types/post';

interface HomeProps {
  posts: PostMetadata[];
}

export const getStaticProps: GetStaticProps = async (): Promise<
  GetStaticPropsResult<HomeProps>
> => {
  const posts = readdirSync('src/posts');

  // Get the metadata from latest 5 posts
  const postsMetadata: PostMetadata[] = posts.map((post) => {
    return require(`../posts/${post}/metadata.json`);
  });
  const latest5Posts = postsMetadata.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);
  return {
    props: {
      posts: latest5Posts,
    },
  };
};

const Home: NextPage<HomeProps> = ({ posts }) => {
  return (
    <>
      <SEO description="some thoughts and experiences from my life." />

      <main className="w-full flex flex-col items-center">
        <h1 className="text-3xl">Daniel T. Rodrigues</h1>
        <p className="mt-4">Some thoughts and experiences from my life.</p>

        <div className="mt-8 flex flex-col w-full items-center">
          <>
            <Link href="/posts">
              <a>
                <h2 className="text-2xl underline">Latest Posts</h2>
              </a>
            </Link>
            <ul>
              {posts.map((post) => (
                <li key={post.slug} className="pt-4 flex flex-col items-center">
                  <Link href={`/posts/${post.slug}`}>
                    <a>
                      <h3 className="text-lg">{post.en.title}</h3>
                    </a>
                  </Link>
                  <p className="text-sm italic">{prettyDate(post.date)}</p>
                  <ul className="flex items-center">
                    {post.tags.map((tag) => (
                      <li key="tag" className="m-2">
                        <Link href={`/posts?tags=${tag}`}>
                          <a className="p-2 bg-slate-300 text-slate-800 rounded text-xs hover:bg-slate-200 hover:text-slate-700">
                            {tag}
                          </a>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </>
        </div>
      </main>
    </>
  );
};

export default Home;
