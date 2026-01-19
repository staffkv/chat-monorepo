import { api } from "./api-client";

interface GetConversationMessagesResponse {
  conversationId: string | null;
  messages: Array<{
    _id: string;
    conversationId: string;
    from: string;
    to: string;
    content: string;
    createdAt: string;
  }>;
}

interface GetConversationMessagesParams {
  userId: string;
  limit?: number;
  before?: string;
}

export async function GetConversationMessages({
  userId,
  limit,
  before,
}: GetConversationMessagesParams): Promise<GetConversationMessagesResponse> {
  const searchParams: Record<string, string> = {};
  if (limit !== undefined) searchParams.limit = String(limit);
  if (before) searchParams.before = before;

  const result = await api.get(`conversations/with/${userId}/messages`, {
    credentials: 'include',
    searchParams,
  }).json<GetConversationMessagesResponse>();

  return result;
}
