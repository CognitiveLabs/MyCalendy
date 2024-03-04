import Link from "next/link";

export default function Header() {
  return (
    <header className="py-4 px-8 bg-gray-900 text-white">
      <div className="container mx-auto flex items-center">
        {/* Keep My Calendy on the left */}
        <Link href="/" className="signika text-2xl">
          My Calendy
        </Link>

        {/* Use flexbox for right-alignment and margin */}
        <div className="flex justify-end space-x-4 ml-auto">
          <Link href="/login" className="signika">
            Sign In
          </Link>
          <Link href="/about" className="signika">
            About
          </Link>
          <Link href="/blog" className="signika">
            Blog
          </Link>
        </div>
      </div>
    </header>
  );
}
