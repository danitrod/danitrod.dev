import { readdirSync } from 'fs';
import type { GetStaticProps, NextPage } from 'next';
import { PostMetadata } from '../../types';

export const getStaticProps: GetStaticProps<PostsProps> = async () => {
  const posts = readdirSync('src/posts');

  const postsMetadata: PostMetadata[] = posts
    .map((post) => {
      return require(`../../posts/${post}/metadata.json`);
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return {
    props: { posts: postsMetadata },
  };
};

interface PostsProps {
  posts: PostMetadata[];
}

const Posts: NextPage<PostsProps> = (props) => {
  return <div>{JSON.stringify(props.posts)}</div>;
};

export default Posts;
