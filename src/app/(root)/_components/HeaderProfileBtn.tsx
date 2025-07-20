"use client"
import { UserButton } from "@clerk/nextjs";

function HeaderProfileBtn() {
  return <UserButton afterSignOutUrl="/" />;
}

export default HeaderProfileBtn;