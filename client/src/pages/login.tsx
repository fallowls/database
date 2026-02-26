import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginCredentials } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface LoginPageProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiRequest("/api/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (response.success) {
        localStorage.setItem("authToken", response.token);
        onLoginSuccess(response.user, response.token);
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err: any) {
      let msg = "Invalid email or password";
      try {
        const parsed = JSON.parse(err.message?.split(": ").slice(1).join(": ") || "{}");
        if (parsed.message) msg = parsed.message;
      } catch { }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient mesh */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 via-transparent to-violet-600/20" />
          <div className="absolute top-1/3 -left-20 w-80 h-80 bg-blue-500/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <span className="text-lg font-bold text-white">C</span>
              </div>
              <span className="text-xl font-semibold text-white tracking-tight">Closo</span>
            </div>
          </div>
          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Your prospects,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                intelligently managed.
              </span>
            </h1>
            <p className="text-white/40 text-sm leading-relaxed">
              260K+ prospects and 175K+ companies at your fingertips.
              Search, filter, and manage your entire sales pipeline from one unified platform.
            </p>
          </div>
          <div className="flex items-center gap-6 text-white/25 text-xs">
            <span>Prospect Management</span>
            <span className="w-1 h-1 rounded-full bg-white/25" />
            <span>Chrome Extension</span>
            <span className="w-1 h-1 rounded-full bg-white/25" />
            <span>LinkedIn Integration</span>
          </div>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                <span className="text-base font-bold text-white">C</span>
              </div>
              <span className="text-lg font-semibold text-white">Closo</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white">Sign in</h2>
            <p className="text-white/30 text-sm mt-1.5">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm" data-testid="login-error">
              {error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <label className="text-xs font-medium text-white/40 mb-1.5 block">Email</label>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="admin@closo.com"
                        className="h-11 bg-white/[0.04] border-white/[0.08] rounded-lg px-4 text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-0 focus:bg-white/[0.06] transition-all"
                        disabled={isLoading}
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <label className="text-xs font-medium text-white/40 mb-1.5 block">Password</label>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="h-11 bg-white/[0.04] border-white/[0.08] rounded-lg px-4 pr-11 text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-0 focus:bg-white/[0.06] transition-all"
                          disabled={isLoading}
                          data-testid="input-password"
                        />
                        <button
                          type="button"
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-all mt-2"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : "Sign in"}
              </Button>
            </form>
          </Form>

          <p className="text-center text-white/15 text-xs mt-10">
            Closo CRM · Enterprise Sales Platform
          </p>
        </div>
      </div>
    </div>
  );
}
