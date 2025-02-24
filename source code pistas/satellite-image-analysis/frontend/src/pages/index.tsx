import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const HomePage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-4xl font-bold">
          Welcome to Satellite Image Analysis
        </h1>
        
        <div className="mt-6">
          <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded mr-2">
            Login
          </Link>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Go to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
};

export default HomePage;