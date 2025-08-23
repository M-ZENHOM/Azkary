import { Icons } from "@/components/Icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProgressInfo } from "electron-updater";
import { useCallback, useEffect, useState } from "react";
import Button from "../ui/button";

interface VersionInfo {
  version: string;
  newVersion: string;
  update: boolean;
}

interface ErrorType {
  message: string;
}

const Update = () => {
  const [checking, setChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [versionInfo, setVersionInfo] = useState<VersionInfo>();
  const [updateError, setUpdateError] = useState<ErrorType>();
  const [progressInfo, setProgressInfo] = useState<Partial<ProgressInfo>>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    description: string;
    cancelText?: string;
    okText?: string;
    onCancel?: () => void;
    onOk?: () => void;
    showFooter?: boolean;
  }>({
    title: "تحديث التطبيق",
    description: "جاري فحص التحديثات...",
    showFooter: false,
  });

  useEffect(() => {
    if (updateError) {
      setDialogConfig({
        title: "خطأ في التحديث",
        description: `حدث خطأ أثناء التحديث: ${updateError.message}`,
        cancelText: "إغلاق",
        onCancel: () => {
          setDialogOpen(false);
          setUpdateError(undefined);
        },
        showFooter: true,
      });
    } else if (updateAvailable && versionInfo) {
      setDialogConfig({
        title: "تحديث متاح",
        description: `الإصدار الجديد متاح: v${versionInfo.newVersion}`,
        cancelText: "لاحقاً",
        okText: "تحديث الآن",
        onCancel: () => {
          setDialogOpen(false);
          setUpdateAvailable(false);
          setVersionInfo(undefined);
        },
        onOk: () => window.ipcRenderer.invoke("start-download"),
        showFooter: true,
      });
    } else if (!updateAvailable && versionInfo && !checking) {
      setDialogConfig({
        title: "لا توجد تحديثات",
        description: "أنت تستخدم أحدث إصدار من التطبيق",
        cancelText: "إغلاق",
        onCancel: () => {
          setDialogOpen(false);
          setVersionInfo(undefined);
        },
        showFooter: true,
      });
    }
  }, [updateAvailable, versionInfo, updateError, checking]);

  const checkUpdate = async () => {
    setChecking(true);
    setUpdateError(undefined);
    setVersionInfo(undefined);
    setUpdateAvailable(false);
    setProgressInfo({ percent: 0 });

    setDialogConfig({
      title: "تحديث التطبيق",
      description: "جاري فحص التحديثات...",
      showFooter: false,
    });
    setDialogOpen(true);

    try {
      const result = await window.ipcRenderer.invoke("check-update");
      setChecking(false);

      if (result?.error) {
        setUpdateError(result.error);
        setUpdateAvailable(false);
      }
    } catch (error) {
      setChecking(false);
      setUpdateError({ message: "حدث خطأ أثناء فحص التحديثات" });
      setUpdateAvailable(false);
    }
  };

  const onUpdateCanAvailable = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: VersionInfo) => {
      setVersionInfo(arg1);
      setUpdateError(undefined);
      setUpdateAvailable(arg1.update);
    },
    []
  );

  const onUpdateError = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: ErrorType) => {
      setUpdateError(arg1);
      setUpdateAvailable(false);
    },
    []
  );

  const onDownloadProgress = useCallback(
    (_event: Electron.IpcRendererEvent, arg1: ProgressInfo) => {
      setProgressInfo(arg1);
      setDialogConfig((prev) => ({
        ...prev,
        title: "جاري التحميل",
        description: `جاري تحميل التحديث... ${Math.round(arg1.percent || 0)}%`,
        cancelText: "إلغاء",
        okText: undefined,
        onCancel: () => window.ipcRenderer.invoke("cancel-download"),
        showFooter: true,
      }));
    },
    []
  );

  const onUpdateDownloaded = useCallback(
    (_event: Electron.IpcRendererEvent, ...args: any[]) => {
      setProgressInfo({ percent: 100 });
      setDialogConfig({
        title: "اكتمل التحميل",
        description:
          "تم تحميل التحديث بنجاح. سيتم إعادة تشغيل التطبيق لتطبيق التحديث.",
        cancelText: "لاحقاً",
        okText: "تثبيت الآن",
        onCancel: () => {
          setDialogOpen(false);
          setProgressInfo({ percent: 0 });
          setUpdateAvailable(false);
          setVersionInfo(undefined);
        },
        onOk: () => window.ipcRenderer.invoke("quit-and-install"),
        showFooter: true,
      });
    },
    []
  );

  useEffect(() => {
    window.ipcRenderer.on("update-can-available", onUpdateCanAvailable);
    window.ipcRenderer.on("update-error", onUpdateError);
    window.ipcRenderer.on("download-progress", onDownloadProgress);
    window.ipcRenderer.on("update-downloaded", onUpdateDownloaded);

    return () => {
      window.ipcRenderer.off("update-can-available", onUpdateCanAvailable);
      window.ipcRenderer.off("update-error", onUpdateError);
      window.ipcRenderer.off("download-progress", onDownloadProgress);
      window.ipcRenderer.off("update-downloaded", onUpdateDownloaded);
    };
  }, []);

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icons.UpdateIcon className="w-5 h-5" />
              {dialogConfig.title}
            </DialogTitle>
            <DialogDescription className="text-right">
              {dialogConfig.description}
            </DialogDescription>
          </DialogHeader>

          {progressInfo?.percent !== undefined && progressInfo.percent > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progressInfo.percent}%` }}
              />
            </div>
          )}

          {dialogConfig.showFooter && (
            <DialogFooter className="flex-row-reverse gap-2">
              {dialogConfig.onOk && (
                <Button onClick={dialogConfig.onOk} variant="success">
                  {dialogConfig.okText}
                </Button>
              )}
              {dialogConfig.onCancel && (
                <Button variant="default" onClick={dialogConfig.onCancel}>
                  {dialogConfig.cancelText}
                </Button>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <Button
        onClick={checkUpdate}
        disabled={checking}
        variant="info"
        size="sm"
        className="fixed bottom-4 left-4"
      >
        <Icons.UpdateIcon className="w-4 h-4 mr-2" />
        {checking ? "جاري الفحص..." : "فحص التحديثات"}
      </Button>
    </>
  );
};

export default Update;
