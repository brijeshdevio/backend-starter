import argon from "argon2";

export const hashPassword = async (password: string): Promise<string> => {
  return await argon.hash(password);
};

export const verifyPassword = async (
  hash: string,
  password: string,
): Promise<boolean> => {
  return await argon.verify(hash, password);
};
