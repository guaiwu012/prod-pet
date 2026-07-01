import { navItems, type AppRoute } from "../app/routes";

interface SidebarProps {
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onOpenDemo?: () => void;
}

export function Sidebar({ activeRoute, onNavigate, onOpenDemo }: SidebarProps) {
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => onNavigate("dashboard")}>
        <span className="brand-pet">●ω●</span>
        <span>
          <strong>PushPet</strong>
          <small>需求小兽</small>
        </span>
      </button>

      <nav className="nav-list" aria-label="主导航">
        {navItems.map((item) => (
          <button
            className={activeRoute === item.id ? "nav-item active" : "nav-item"}
            key={item.id}
            onClick={() => onNavigate(item.id)}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-note">
        <span>{onOpenDemo ? "Web 演示模式" : "本地模式"}</span>
        <p>数据只保存在这台设备上。</p>
        {onOpenDemo && <button onClick={onOpenDemo}>返回作品介绍</button>}
      </div>
    </aside>
  );
}
