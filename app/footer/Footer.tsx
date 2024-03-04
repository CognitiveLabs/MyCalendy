import GitHub from "@/components/icons/GitHub";
import Logo from "@/components/icons/Logo";
import Link from "next/link";

export default function Footer() {
  return (
    <div className="pt-20">
      <footer className="signika mx-auto max-w-[1920px] px-6 bg-zinc-900">
        <div className="grid grid-cols-1 gap-4 py-6 text-white transition-colors duration-150 border-b lg:grid-cols-12 border-zinc-600 bg-zinc-900">
          <div className="col-span-1 lg:col-span-2">
            <Link href="/" className="flex items-center flex-initial font-bold">
              <span>My Calendy</span>
            </Link>

            <div className="col-span-1 lg:col-span-2 flex flex-col justify-start">
              <Link href="/about" className="hover:text-zinc-200">
                About
              </Link>
              <Link href="/blog" className="hover:text-zinc-200">
                Blog
              </Link>
              <Link href="/sources" className="hover:text-zinc-200">
                Sources
              </Link>
            </div>
          </div>
          <div className="col-span-1 lg:col-span-2 flex flex-col justify-start">
            <p className="font-bold">LEGAL</p>
            <Link href="/privacy" className="hover:text-zinc-200">
              Privacy Policy
            </Link>
            <Link href="/termsofuse" className="hover:text-zinc-200">
              Terms of Use
            </Link>
          </div>
          <div className="flex items-center col-span-1 text-white lg:col-span-6 lg:justify-end">
            <a
              aria-label="Github Repository"
              href="https://github.com/CognitiveLabs"
              className="hover:text-zinc-200"
            >
              <GitHub />
            </a>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between py-6 space-y-2 md:flex-row bg-zinc-900">
          <div>&copy; {new Date().getFullYear()} My Calendy</div>
          <div className="flex items-center">
            <span className="text-white">Created by</span>
            <a
              href="https://github.com/CognitiveLabs"
              aria-label="Cognitive Labs Link"
              className="ml-2 hover:text-zinc-200"
            >
              <img
                src="/cognitivelabs.png"
                alt="My Calendy Logo"
                className="inline-block h-8"
              />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
