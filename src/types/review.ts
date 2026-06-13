export interface Review {
  id: number;
  star: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    avatar: string | null;
  };
}