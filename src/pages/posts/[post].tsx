import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { readdirSync, readFileSync } from 'fs';
import { PostMetadata } from '../../types';
import ReactMarkdown from 'react-markdown';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = readdirSync('src/posts');

  return {
    paths: posts.map((post) => ({
      params: {
        post: post.replace('./src/posts/', ''),
      },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Partial<PostProps>> = async (ctx) => {
  if (ctx.params && ctx.params.post) {
    const metadata = JSON.parse(
      readFileSync(`src/posts/${ctx.params.post}/metadata.json`).toString()
    );
    const content = readFileSync(`src/posts/${ctx.params.post}/en.md`).toString();
    return { props: { metadata, content } };
  }

  return { props: {} };
};

interface PostProps {
  metadata: PostMetadata;
  content: string;
}

const Post: NextPage<PostProps> = (props) => {
  return (
    <article className='flex flex-col items-center post'>
      <ReactMarkdown>{props.content}</ReactMarkdown>
    </article>
  );
};

export default Post;
