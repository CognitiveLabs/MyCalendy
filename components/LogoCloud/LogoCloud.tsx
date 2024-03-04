export default function LogoCloud() {
  return (
    <div>
      <p className=" text-xs uppercase text-zinc-400 text-center font-bold tracking-[0.3em]">
        My Calendy is built with
      </p>
      <div className="grid grid-cols-1 place-items-center	my-8 space-y-4 sm:mt-8 sm:space-y-0 md:mx-auto md:max-w-2xl sm:grid sm:gap-6 sm:grid-cols-7">
        <div className="flex items-center justify-start h-12">
          <a href="https://LangChain.com" aria-label="LangChain Link">
            <img
              src="/langchain.png"
              alt="LangChain Logo"
              className="h-6 text-white"
            />
          </a>
        </div>
        <div className="flex items-center justify-start h-12">
          <a href="https://supabase.io" aria-label="supabase.io Link">
            <img src="/supabase.svg" alt="supabase.io Logo" className="h-12" />
          </a>
        </div>
        <div className="flex items-center justify-start h-12">
          <a href="https://google.com" aria-label="Vercel.com Link">
            <img
              src="/google.png"
              alt="Vercel.com Logo"
              className="h-5 text-white"
            />
          </a>
        </div>
        <div className="flex items-center justify-start h-12">
          <a href="https://stripe.com" aria-label="stripe.com Link">
            <img
              src="/stripe.svg"
              alt="stripe.com Logo"
              className="h-9 text-white"
            />
          </a>
        </div>
        <div className="flex items-center justify-start h-12">
          <a href="https://github.com" aria-label="github.com Link">
            <img
              src="/github.svg"
              alt="github.com Logo"
              className="h-5 text-white"
            />
          </a>
        </div>
        <div className="flex items-center justify-start h-12">
          <a href="https://nextjs.org" aria-label="Next.js Link">
            <img
              src="/nextjs.svg"
              alt="Next.js Logo"
              className="h-4 text-white"
            />
          </a>
        </div>
        <div className="flex items-center justify-start h-12">
          <a href="https://vercel.com" aria-label="Vercel.com Link">
            <img
              src="/vercel.svg"
              alt="Vercel.com Logo"
              className="h-5 text-white"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
