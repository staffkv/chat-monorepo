import { api } from "./api-client";

interface SignInWithPasswordRequest {
  username: string;
  password: string;
}

interface SignInWithPasswordResponse {
  token: string;
}

export async function signInWithPassword({
  username, 
  password
}: SignInWithPasswordRequest) {
  const result = await api.post('session/login', {
    json: {
      username,
      password,
    }
  }).json<SignInWithPasswordResponse>()

  return result
}