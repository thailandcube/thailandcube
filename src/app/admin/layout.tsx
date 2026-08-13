import AdminSidebar from './_components/AdminSidebar';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='admin-dashboard-container flex'>
      <AdminSidebar />
      <main className='flex-1 pl-8 py-8 pr-2'>{children}</main>
    </div>
  );
}