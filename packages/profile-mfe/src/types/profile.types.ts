export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  age?: number;
  name?: string;
  email: string;
  avatarUrl?: string;
  subscriptionPlan?: string;

  stats?: {
    watched: number;
    favorites: number;
    reviews: number;
  };
}
