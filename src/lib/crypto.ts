import crypto from "node:crypto";

export const randomString = (size: number = 16) =>
  crypto.randomBytes(size).toString("hex");

export const hashString = (str: string) =>
  crypto.createHash("sha256").update(str).digest("hex");
