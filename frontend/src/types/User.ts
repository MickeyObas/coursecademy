export type User = {
  username: string,
  email: string,
  full_name: string,
  account_type: "S" | "I"
}

export type Role = "I" | "S";

export type Profile = {
  user: User,
  profile_picture: string
}
