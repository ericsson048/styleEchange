import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <Skeleton className="w-full max-w-md h-96 rounded-2xl" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
