import { api } from "./api-client";

interface GetUsersResponse {
  users: Array<{
    _id: string;
    name: string;
    username: string;
    status: 'online' | 'offline';
  }>;
}

export async function GetUsers(): Promise<GetUsersResponse> {
  const result = await api.get('users', {
    credentials: 'include',
  }).json<GetUsersResponse>();

  return result;
}
