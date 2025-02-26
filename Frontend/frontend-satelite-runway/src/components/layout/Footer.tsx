/**
 * Footer component for the application
 * filepath: frontend/src/components/layout/Footer.tsx
 */
import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  // Get current year for copyright
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-4 px-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-sm text-gray-400">
            &copy; {currentYear} Satellite Image Analysis. All rights reserved.
          </p>
        </div>
        
        <div className="flex space-x-6">
          <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
            About
          </Link>
          <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;