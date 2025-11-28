import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const hashAdminPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12);
};

export const verifyAdminPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateAdminToken = (adminId: number): string => {
  return jwt.sign({ adminId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

export const verifyAdminToken = (token: string): { adminId: number } => {
  return jwt.verify(token, process.env.JWT_SECRET!) as { adminId: number };
};
