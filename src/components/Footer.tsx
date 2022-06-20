import React from 'react';
import githubLogo from '../../public/assets/github.png';
import linkedInLogo from '../../public/assets/linkedin.png';
import Image from 'next/image';

const Footer = (): JSX.Element => {
  return (
    <footer className='p-8 flex w-full justify-center'>
      <a
        href='https://github.com/danitrod'
        target='_blank'
        rel='noopener noreferrer'
        className='p-4'
      >
        <Image src={githubLogo} alt='GitHub' height={32} width={32} />
      </a>
      <a
        href='https://linkedin.com/in/danitrod'
        target='_blank'
        rel='noopener noreferrer'
        className='p-4'
      >
        <Image src={linkedInLogo} alt='LinkedIn' height={32} width={32} />
      </a>
    </footer>
  );
};

export default Footer;
