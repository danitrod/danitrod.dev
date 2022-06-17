import type { NextPage } from 'next';
import SEO from '../components/SEO';

const NotFound: NextPage = () => {
  return (
    <>
      <SEO title='not found' description='Are you sure that this is the correct URL?' />
    </>
  );
};

export default NotFound;
