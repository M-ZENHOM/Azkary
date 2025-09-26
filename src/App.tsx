import { useState } from "react";
import Azkar from "./components/Azkar";
import Layout from "./components/Layout";
import { NotificationSettings } from "./components/NotificationSettings";
import Button from "./components/ui/button";
import Update from "./components/update";
import { cn } from "./lib/utils";
import { NotificationSettings as NotificationSettingsType } from "./type/electron";

function App() {
  const [activeTab, setActiveTab] = useState<"zekr" | "settings">("zekr");
  const [_, setNotificationSettings] = useState<NotificationSettingsType>({
    notificationInterval: 60,
    enabled: true,
    showTray: true,
    muteSound: false,
    autoStartup: true,
  });

  const handleSettingsChange = (settings: NotificationSettingsType) => {
    setNotificationSettings(settings);
  };

  return (
    <Layout className="mt-4">
      <div className="flex w-full bg-white rounded-lg p-1 gap-3">
        <Button
          onClick={() => setActiveTab("zekr")}
          className={cn("py-2 px-4 w-full", {
            "bg-emerald-500 border-emerald-500 text-white":
              activeTab === "zekr",
          })}
        >
          إدارة الأذكار
        </Button>
        <Button
          onClick={() => setActiveTab("settings")}
          className={cn("py-2 px-4 w-full", {
            "bg-emerald-500 border-emerald-500 text-white":
              activeTab === "settings",
          })}
        >
          الإعدادات
        </Button>
      </div>

      {activeTab === "zekr" ? (
        <Azkar />
      ) : (
        <NotificationSettings onSettingsChange={handleSettingsChange} />
      )}
      <Update />
    </Layout>
  );
}

export default App;
