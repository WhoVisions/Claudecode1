'use client';

import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { SocialMediaBar } from './SocialMediaBar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <SocialMediaBar />

      {/* Main Content */}
      <main className="content-wrapper flex-1 pt-20">
        {children}
      </main>

      {/* Footer with slide-behind effect */}
      <div className="slide-behind">
        <Footer />
      </div>
    </div>
  );
}
