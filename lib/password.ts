import { compare, hash } from "bcryptjs";

const COST = 12;

export async function hashPassword(password: string) {
  return hash(password, COST);
}

export async function verifyPassword(password: string, stored: string) {
  return compare(password, stored).catch(() => false);
}
