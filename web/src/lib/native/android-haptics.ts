import { Capacitor } from "@capacitor/core";

export async function androidHapticLight() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Plugin optional until installed on device.
  }
}
