import { readdirSync } from 'fs';

import type { GetStaticProps, NextPage } from 'next';
import Link from 'next/link';
import { useState } from 'react';

import SEO from '@/components/SEO';
import { PostMetadata } from '@/types/post';
import { prettyDate } from 'src/utils';

export const getStaticProps: GetStaticProps<PostsProps> = async () => {
  const posts = readdirSync('src/posts');

  const postsMetadata: PostMetadata[] = posts
    .map((post) => {
      return require(`../../posts/${post}/metadata.json`);
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const uniqueTags = postsMetadata
    .reduce<string[]>((prev, curr) => {
      const newTags = curr.tags.filter((tag) => !prev.includes(tag));
      return [...prev, ...newTags];
    }, [])
    .sort();

  return {
    props: { posts: postsMetadata, tags: uniqueTags },
  };
};

interface PostsProps {
  posts: PostMetadata[];
  tags: string[];
}

const Posts: NextPage<PostsProps> = (props) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');

  const selectTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <>
      <SEO title="posts" description="Check out my recent posts." />
      <main className="flex flex-col items-center">
        <h1 className="text-3xl">Posts</h1>
        <input
          type="text"
          placeholder="Search"
          className="p-2 mt-2 text-sm text-slate-700 rounded-md"
        />
        <ul className="flex mt-2">
          {props.tags.map((tag) => (
            <li key="tag" className="m-2">
              <div
                className={`p-2 ${
                  selectedTags.includes(tag) ? 'bg-slate-100' : 'bg-slate-300'
                } text-slate-800 rounded text-xs hover:bg-slate-200 hover:text-slate-700`}
                onClick={() => selectTag(tag)}
              >
                {tag}
              </div>
            </li>
          ))}
        </ul>
        <ul className="mt-2">
          {props.posts.map((post) => (
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
      </main>
    </>
  );
};

export default Posts;
