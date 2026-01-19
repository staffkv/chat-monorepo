import { api } from "./api-client";

interface GetProfileResponse  {
  user: {
    _id: string;
    name: string;
    username: string;
  }
}

export async function GetProfile(_sub: string): Promise<GetProfileResponse> {
  const result = await api.get<GetProfileResponse>('profile', {
    credentials: 'include',
  }).json<GetProfileResponse>();
  return result;
}
