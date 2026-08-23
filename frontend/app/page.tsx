"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading) router.replace(isAuthenticated ? "/dashboard" : "/login"); }, [loading, isAuthenticated]);
  return null;
}