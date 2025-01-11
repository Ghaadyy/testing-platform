import { LoginForm } from "@/components/LoginForm";
import { Toaster } from "@/shadcn/components/ui/toaster";

export default function LoginScreen() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
        <Toaster />
      </div>
    </div>
  );
}
