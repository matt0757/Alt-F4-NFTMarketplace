export interface User {
  address: string;
  provider: string;
  email?: string;
  name?: string;
}

export interface Credential {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
