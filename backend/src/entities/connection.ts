export interface Connection {
  connectionId: string;
  roomKey?: string;
  nickName?: string;
  joinedAt: number;
  ttl: number;
}
