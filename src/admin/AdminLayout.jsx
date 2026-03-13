import { Outlet, useLocation } from "react-router-dom";
import { FiGrid, FiUsers, FiMessageSquare, FiAlertCircle, FiBell, FiClock, FiLogOut } from "react-icons/fi";
import { BiTrendingUp } from "react-icons/bi";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function getTitle(pathname) {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/users")) return "Users";
  if (pathname.startsWith("/admin/reviews")) return "Reviews";
  if (pathname.startsWith("/admin/debates")) return "Debates";
  if (pathname.startsWith("/admin/reports")) return "Reports";
  if (pathname.startsWith("/admin/analytics")) return "Analytics";
  if (pathname.startsWith("/admin/announcements")) return "Announcements";
  if (pathname.startsWith("/admin/audit-log")) return "Audit Log";
  return "Admin";
}

const navSections = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", to: "/admin", icon: FiGrid },
    ],
  },
  {
    label: "CONTENT",
    items: [
      { label: "Users", to: "/admin/users", icon: FiUsers },
      { label: "Reviews", to: "/admin/reviews", icon: FiMessageSquare },
      { label: "Debates", to: "/admin/debates", icon: FiMessageSquare },
      { label: "Reports", to: "/admin/reports", icon: FiAlertCircle },
    ],
  },
  {
    label: "PLATFORM",
    items: [
      { label: "Analytics", to: "/admin/analytics", icon: BiTrendingUp },
      { label: "Announcements", to: "/admin/announcements", icon: FiBell },
      { label: "Audit Log", to: "/admin/audit-log", icon: FiClock },
    ],
  },
];

function NavLink({ to, label, Icon }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-2 py-2 rounded-lg text-[13px] transition-colors ${
        active
          ? "bg-[#161616] text-[#f0f0f0] border-l-2 border-[#e8ff47] pl-[10px]"
          : "text-[#666] hover:bg-[#141414] hover:text-[#999]"
      }`}
    >
      <Icon size={14} />
      <span>{label}</span>
    </Link>
  );
}

export default function AdminLayout() {
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white">
      <aside className="w-[240px] h-screen bg-[#0d0d0d] border-r border-[#1a1a1a] flex flex-col">
        <div className="p-5 pb-4">
          <div className="font-syne text-[16px] font-[900] text-[#f0f0f0]">GRIDLOCK</div>
          <div className="text-[11px] text-[#444] tracking-[0.1em] uppercase mt-1">Admin Panel</div>
          <div className="border-t border-[#1a1a1a] mt-4" />
        </div>

        <div className="px-3 pb-6 flex-1 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label} className="mb-6">
              <div className="text-[10px] text-[#333] uppercase tracking-[0.15em] px-2 pb-1">
                {section.label}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink key={item.to} to={item.to} label={item.label} Icon={item.icon} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-[#0d0d0d] border-t border-[#1a1a1a] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#222] overflow-hidden flex items-center justify-center">
              {userProfile?.avatar ? (
                <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[13px] font-bold text-[#888]">{userProfile?.username?.charAt(0)?.toUpperCase() || 'A'}</span>
              )}
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#eee] truncate max-w-[110px]">{userProfile?.displayName || userProfile?.username}</div>
              <div className="text-[11px] text-[#555]">Admin</div>
            </div>
          </div>
          <Link
            to="/"
            className="text-[13px] text-[#555] hover:text-[#f0f0f0] flex items-center gap-1"
          >
            <FiLogOut size={13} />
            Back to Site
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 h-[56px] bg-[rgba(10,10,10,0.9)] backdrop-blur-[10px] border-b border-[#1a1a1a] px-8 flex items-center justify-between">
          <h1 className="font-syne text-[18px] font-[800] text-[#f0f0f0]">{getTitle(location.pathname)}</h1>
          <div className="flex items-center gap-4 text-[12px] text-[#444]">
            <span id="admin-date">{new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="bg-[rgba(232,255,71,0.1)] border border-[rgba(232,255,71,0.2)] text-[#e8ff47] rounded-[4px] px-3 py-1 text-[11px] font-semibold">
              ADMIN
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
