export type DeviceInfo = {
  type: "laptop" | "phone" | "tablet";
  deviceName: string;
  userAgent?: string;
  ipAddress?: string;
};
