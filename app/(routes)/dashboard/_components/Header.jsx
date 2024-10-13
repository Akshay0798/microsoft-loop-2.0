"use client";
import Logo from "@/app/_components/Logo";
import { OrganizationSwitcher, useAuth, UserButton } from "@clerk/nextjs";
import React from "react";

function Header() {
  const { orgId } = useAuth();
  console.log(orgId);
  return (
    <div className="flex justify-between items-center p-3 shadow-sm">
      <Logo />

      <OrganizationSwitcher
        afterLeaveOrganizationUrl={"/dashboard"}
        afterCreateOrganizationUrl={"/dashboard"}
      />
      <UserButton />
    </div>
  );
}

export default Header;
