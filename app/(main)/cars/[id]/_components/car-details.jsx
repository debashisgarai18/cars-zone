"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function CarDetails({ car, testDriveInfo }) {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  return <div>Car Details</div>;
}
