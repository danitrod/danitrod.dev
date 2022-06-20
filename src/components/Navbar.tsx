import Link from 'next/link';
import React from 'react';

const Navbar = (): JSX.Element => {
  return (
    <nav className='p-8 flex flex-row justify-between w-full'>
      <Link href='/'>
        <a>
          <h2>danitrod.dev</h2>
        </a>
      </Link>
      <div>
        <Link href='/about'>
          <a className='mr-4'>About</a>
        </Link>
        <Link href='/posts'>
          <a className='mr-4'>Posts</a>
        </Link>
        <a
          href='https://github.com/danitrod/danitrod.dev'
          target='_blank'
          rel='noopener noreferrer'
        >
          Source
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
