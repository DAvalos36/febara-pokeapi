import { cookies } from "next/headers";

import { sessionCookie, verifySessionToken } from "./session";

export async function currentUser() {
  const store = await cookies();

  return verifySessionToken(store.get(sessionCookie.name)?.value);
}
