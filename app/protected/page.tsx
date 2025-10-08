import { LogoutButton } from "@/components/logout-button";

export default function Protected() {
  return (
    <div>
      <h1>Protected Page - Access Granted</h1>
      <LogoutButton />
    </div>
  );
}