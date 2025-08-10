import { getAdmin } from "@/actions/admin";
import Header from "@/components/Header";
import { notFound } from "next/navigation";
import Sidebar from "./_components/sidebar";

export default async function AdminLayout() {
  const admin = await getAdmin();

  if (!admin.authorized) {
    return notFound();
  }
  return (
    <div className="h-full">
      <Header isAdminPage={true} />
      <div className="flex h-full w-56 flex-col top-20 insert-y-0 z-50 fixed">
        <Sidebar />
      </div>
    </div>
  );
}
