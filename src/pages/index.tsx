import type { NextPage } from 'next';
import Head from 'next/head';
import SEO from '../components/SEO';

const Home: NextPage = () => {
  return (
    <>
      <SEO description='some thoughts and experiences from my life.' />

      <main className='w-full flex flex-col items-center'>
        <h1 className='text-3xl'>Daniel T. Rodrigues</h1>
        <p className='mt-4'>Some thoughts and experiences of my life.</p>

        <div className='mt-8'>
          <a href='/posts'>
            <h2 className='text-xl underline'>Latest Posts</h2>
          </a>
        </div>
      </main>
    </>
  );
};

export default Home;
