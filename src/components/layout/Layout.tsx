import type { FC } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  signOut?: () => void;
}

const Layout: FC<LayoutProps> = ({ signOut }) => (
  <div className="flex min-h-screen bg-background">
    <Sidebar signOut={signOut} />
    <main className="flex-1 overflow-y-auto p-8">
      <Outlet />
    </main>
  </div>
);

export default Layout;
