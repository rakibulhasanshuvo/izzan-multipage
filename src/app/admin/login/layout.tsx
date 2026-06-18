import React from "react";

export const metadata = {
  title: "Login - Admin Dashboard",
  description: "Sign in to the admin dashboard",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
