import type { NextPage } from 'next';
import Link from 'next/link';

import SEO from '@/components/SEO';

const NotFound: NextPage = () => {
  return (
    <>
      <SEO title="not found" description="Are you sure that this is the correct URL?" />
      <main className="flex flex-col items-center px-4 text-md">
        <h1 className="text-3xl">Oops!</h1>
        <p className="text-md mt-2">
          The page you were looking for could not be found. Perhaps you may want to go{' '}
          <a className="cursor-pointer text-slate-400" onClick={() => history.back()}>
            back
          </a>
          , or visit the{' '}
          <Link href="/">
            <a className="text-slate-400">home page</a>
          </Link>
          ?
        </p>
      </main>
    </>
  );
};

export default NotFound;
