export interface Profile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  subscriptionPlan?: string;

  stats?: {
    watched: number;
    favorites: number;
    reviews: number;
  };
}
