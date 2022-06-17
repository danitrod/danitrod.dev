import Head from 'next/head';
import React from 'react';

interface SEOProps {
  title?: string;
  description?: string;
}

const SEO = (props: SEOProps): JSX.Element => {
  return (
    <Head>
      <title>{(props.title ? `${props.title} | ` : '') + `dani's blog`}</title>
      <meta name='description' content={props.description} />
    </Head>
  );
};

export default SEO;
