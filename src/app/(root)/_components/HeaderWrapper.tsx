"use client";

import { currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import React, { useEffect } from "react";
import { api } from "../../../../convex/_generated/api";
import Header from "./Header";
import { useUser } from "@clerk/nextjs";

function HeaderWrapper() {
  const { user } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (user) {
        const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
        await convex.query(api.users.getUser, {
          userId: user.id,
        });
      }
    };

    syncUser();
  }, [user]);

  return <Header />;
}

export default HeaderWrapper;