import { isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { AiSettingsPage } from "../pages/AiSettingsPage";
import { ColleaguesPage } from "../pages/ColleaguesPage";
import { CommunicationLogsPage } from "../pages/CommunicationLogsPage";
import { CycleConfigPage } from "../pages/CycleConfigPage";
import { DashboardPage } from "../pages/DashboardPage";
import { HealthSettingsPage } from "../pages/HealthSettingsPage";
import { PetDesignPage } from "../pages/PetDesignPage";
import { WeeklyReportPage } from "../pages/WeeklyReportPage";
import { loadAppData, saveAppData } from "../storage/storage";
import type { AppData } from "../types";
import type { AppRoute } from "./routes";

export function App() {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [route, setRoute] = useState<AppRoute>("dashboard");

  useEffect(() => {
    if (!isTauri()) return undefined;

    let unlisten: (() => void) | undefined;
    listen("pushpet://app-data-updated", () => {
      setData(loadAppData());
    }).then((dispose) => {
      unlisten = dispose;
    });

    return () => unlisten?.();
  }, []);

  const updateData = (updater: (current: AppData) => AppData) => {
    setData((current) => {
      const next = updater(current);
      saveAppData(next);
      return next;
    });
  };

  const page = useMemo(() => {
    switch (route) {
      case "dashboard":
        return <DashboardPage data={data} updateData={updateData} onNavigate={setRoute} />;
      case "cycle":
        return <CycleConfigPage data={data} updateData={updateData} />;
      case "colleagues":
        return <ColleaguesPage data={data} updateData={updateData} />;
      case "logs":
        return <CommunicationLogsPage data={data} updateData={updateData} />;
      case "weekly":
        return <WeeklyReportPage data={data} />;
      case "petDesign":
        return <PetDesignPage data={data} updateData={updateData} />;
      case "ai":
        return <AiSettingsPage data={data} updateData={updateData} />;
      case "health":
        return <HealthSettingsPage data={data} updateData={updateData} />;
    }
  }, [data, route]);

  return (
    <div className="app-layout">
      <Sidebar activeRoute={route} onNavigate={setRoute} />
      <main className="page-shell">{page}</main>
    </div>
  );
}
