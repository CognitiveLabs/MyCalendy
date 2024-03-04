import { redirect } from "next/navigation";
import CalendarEvent from "./CalendarEvent";
import { createClient } from "@/utils/supabase/server";

export default async function PrivatePage() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/");
  }
  console.log(session);
  return (
    <>
      <p>Hello {data.user.email}</p>
      <CalendarEvent />
    </>
  );
}
