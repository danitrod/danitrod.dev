import type { NextPage } from 'next';

const about: NextPage = () => {
  return (
    <main className="flex flex-col items-center p-4">
      <h1 className="text-3xl">About</h1>
      <p className="text-md mt-2 lg:max-w-6xl md:max-w-xl">
        Greetings! I am Daniel, a computer scientist from Sao Paulo, Brazil.
      </p>
    </main>
  );
};

export default about;
