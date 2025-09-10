import { useState } from "react";
import Azkar from "./components/Azkar";
import Layout from "./components/Layout";
import { NotificationSettings } from "./components/NotificationSettings";
import Button from "./components/ui/button";
import { cn } from "./lib/utils";
import { NotificationSettings as NotificationSettingsType } from "./type/electron";
import Update from "./components/update";

function App() {
  const [activeTab, setActiveTab] = useState<"zekr" | "settings">("zekr");
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettingsType>({
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
      <div className="w-full bg-white rounded-lg text-center p-4 text-sm text-black">
        {notificationSettings.enabled ? (
          <div className="space-y-2">
            <p>
              الإشعارات مفعلة - كل {notificationSettings.notificationInterval}{" "}
              ثانية
              {notificationSettings.notificationInterval >= 60 && (
                <span className="text-black font-bold">
                  {" "}
                  (
                  {Math.round(
                    (notificationSettings.notificationInterval / 60) * 10
                  ) / 10}{" "}
                  دقيقة)
                </span>
              )}
            </p>
            <p className="text-sm text-gray-600">
              {notificationSettings.muteSound
                ? "🔇 الصوت مكتوم"
                : "🔊 الصوت مفعل"}
            </p>
            <p className="text-sm text-gray-600">
              {notificationSettings.autoStartup
                ? "🚀 التشغيل التلقائي مفعل"
                : "⏹️ التشغيل التلقائي معطل"}
            </p>
          </div>
        ) : (
          <p>الإشعارات معطلة</p>
        )}
      </div>

      <Update />
    </Layout>
  );
}

export default App;
