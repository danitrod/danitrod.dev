import type { GetStaticProps, GetStaticPropsResult, NextPage } from 'next';
import SEO from '../components/SEO';
import { readdirSync } from 'fs';
import { PostMetadata } from '../types';
import Link from 'next/link';
import { prettyDate } from '../utils';

interface HomeProps {
  posts: PostMetadata[];
}

export const getStaticProps: GetStaticProps = async (
  context
): Promise<GetStaticPropsResult<HomeProps>> => {
  const posts = readdirSync('src/posts');

  // Get the metadata from latest 5 posts
  const postsMetadata: PostMetadata[] = posts.map((post) => {
    return require(`../posts/${post}/metadata.json`);
  });
  const latest5Posts = postsMetadata.sort((a, b) => (a.date > b.date ? 1 : -1)).slice(0, 5);
  return {
    props: {
      posts: latest5Posts,
    },
  };
};

const Home: NextPage<HomeProps> = ({ posts }) => {
  return (
    <>
      <SEO description='some thoughts and experiences from my life.' />

      <main className='w-full flex flex-col items-center'>
        <h1 className='text-3xl'>Daniel T. Rodrigues</h1>
        <p className='mt-4'>Some thoughts and experiences of my life.</p>

        <div className='mt-8 flex flex-col w-full items-center'>
          <>
            <a href='/posts'>
              <h2 className='text-2xl underline'>Latest Posts</h2>
            </a>
            {posts.map((post) => (
              <div key={post.slug} className='pt-4 flex flex-col'>
                <Link href={`/posts/${post.slug}`}>
                  <a>
                    <h3 className='text-lg'>{post.en.title}</h3>
                  </a>
                </Link>
                <p className='text-sm self-end'>{prettyDate(post.date)}</p>
              </div>
            ))}
          </>
        </div>
      </main>
    </>
  );
};

export default Home;
