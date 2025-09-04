export interface Env {
  DB: any; // D1Database type not available in this context
}

export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}
