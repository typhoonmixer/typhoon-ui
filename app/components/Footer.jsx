import Link from "next/link";
import React from "react";
import Logo from "./Logo";

function Footer() {
  return (
    <footer className="bg-card border-t border-border py-16 px-6 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        <div>
          <Logo />
          <p className="text-muted-foreground text-sm max-w-xs mt-4">
            The privacy layer for Starknet. Open source, immutable, and
            trustless.
          </p>
        </div>

        <div className="flex flex-wrap gap-8 md:gap-12 text-sm font-medium text-muted-foreground">
          <div className="flex flex-col gap-4">
            <span className="text-foreground font-bold text-xs uppercase tracking-wider">
              Product
            </span>
            <Link href="/app" className="hover:text-accent transition-colors">
              App
            </Link>
            <Link
              href="/app/compliance"
              className="hover:text-accent transition-colors"
            >
              Compliance
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-foreground font-bold text-xs uppercase tracking-wider">
              Resources
            </span>
            <Link
              href="https://typhoon-2.gitbook.io/typhoon-docs"
              className="hover:text-accent transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="https://github.com/typhoonmixer/typhoon_sdk_docs"
              className="hover:text-accent transition-colors"
            >
              Typhoon SDK
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-foreground font-bold text-xs uppercase tracking-wider">
              Social
            </span>
            <Link
              href="https://x.com/Typhoon_mixer"
              className="hover:text-accent transition-colors"
            >
              Twitter
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-border/50 text-xs text-muted-foreground flex justify-between items-center">
        <p>© {new Date().getFullYear()} Typhoon Protocol.</p>
        <div className="flex gap-4">
          <Link href="#" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-foreground">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
