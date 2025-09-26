import { createAuthClient } from "better-auth/svelte";

export const auth = createAuthClient({
	baseURL: "http://localhost:3000/auth",
});
export const { signIn, signUp, useSession } = auth;