export default function Privacy() {
  return (
    <div className="flex flex-col gap-5 items-center page-width mx-auto my-10">
      <h3 className="text-4xl signika-header font-extrabold sm:text-center sm:text-6xl">
        Privacy Policy
      </h3>
      <p className="text-2xl signika-title font-extrabold sm:text-center">
        Your privacy matters to us as much as it does to you.
      </p>
      <p>
        We will never sell your data or ever try to profit from it. We are here
        to help you, not to exploit you.
      </p>
      <p>
        When you sign into your account, only your email address and any name
        you input is stored, and that is in our Supabase database.
      </p>
      <p>
        When you purchase a subscription, none of your payment details are input
        into this website or ever known by us. Your payment information is input
        with Stripe and all data is stored with them. We do not have access to
        any of your payment information and never will. We only know if you have
        a subscription or not.
      </p>
    </div>
  );
}
