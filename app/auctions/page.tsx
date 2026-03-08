import { redirect } from "next/navigation";

export default function AuctionsPage() {
  redirect("/marketplace?type=AUCTION");
}
