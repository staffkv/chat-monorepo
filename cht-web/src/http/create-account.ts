import { api } from "./api-client";

interface CreateAccountRequest {
  name: string;
  username: string;
  password: string;
}

export async function createAccount({
  name,
  username,
  password,
}: CreateAccountRequest) {
  await api.post('session/register', {
    json: {
      name,
      username,
      password,
    },
  });
}
