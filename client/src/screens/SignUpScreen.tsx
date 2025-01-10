import { SignUpForm } from "@/components/SignUpForm";
import { Toaster } from "@/shadcn/components/ui/toaster";

export default function SignUpScreen() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm />
        <Toaster />
      </div>
    </div>
  );
}
