import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  title?:    string;
  subtitle?: string;
  actions?:  React.ReactNode;
}

export function AppLayout({ children, title, subtitle, actions }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Header */}
        {title && (
          <header
            className="shrink-0 px-8 py-5"
            style={{
              background: "rgba(7,7,26,0.8)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-[var(--text)]">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-[var(--text-2)] mt-0.5">{subtitle}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          </header>
        )}

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
