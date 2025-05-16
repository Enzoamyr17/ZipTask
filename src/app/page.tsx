"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ToggleDarkMode from "@/components/toggleDarkmode";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [showSignup, setShowSignup] = useState(false);
  const { setUser } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          // Add other user properties as needed
        });
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }else{
        // Clear all fields
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        // Reload the page
        window.location.reload();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleSignup = () => {
    setShowSignup(!showSignup);
  };

  const toggleLogin = () => {
    setShowSignup(!showSignup);
  };

  const handleConfirmPassword = () => {
    if (password !== confirmPassword && confirmPassword.length >= password.length) {
      return false;
    }
    return true;
  };

  return (
    <div className="text-center h-screen flex items-center justify-center gap-4">
      <ToggleDarkMode />

      <div className="bg-primary/10 border border-primary/20 shadow-md dark:shadow-[0_0_10px_rgba(255,255,255,0.2)] w-full max-w-md rounded-lg p-4 mx-4">  
        <h1 className="text-2xl font-semibold text-primary/90 my-6">ZipTask</h1>
        <form onSubmit={handleLogin} className={showSignup ? "hidden" : "block"}>
          <div className="flex flex-col gap-2">
            <Input 
              type="email" 
              id="login_email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Input 
              type="password" 
              id="login_password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
            <Link href="/signup" className="m-auto text-center">
              <Button 
                type="button" 
                variant="link" 
                className="text-muted-foreground text-xs"
                onClick={() => toggleSignup()}
                disabled={loading}
              >
                Don't have an account? Sign up
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="w-1/3 m-auto my-4"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>
        <form onSubmit={handleSignup} className={showSignup ? "block" : "hidden"}>
          <div className="flex flex-col gap-2">
            <Input 
              type="email" 
              id="signup_email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Input 
              type="password" 
              id="signup_password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <Input 
              type="password" 
              id="signup_confirm_password" 
              placeholder="Confirm Password" 
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                handleConfirmPassword();
              }}
              required
              disabled={loading}
            />
            {!handleConfirmPassword() && (
              <label className={`text-xs opacity-80 text-red-500`}>
                Passwords do not match.
              </label>
            )}
            {handleConfirmPassword() && confirmPassword.length === password.length && password.length > 0 && (
              <label className={`py-1 text-xs text-green-600`}>
                Passwords match!
              </label>
            )}
            <Link href="/" className="m-auto text-center">
              <Button 
                type="button" 
                variant="link" 
                className="text-muted-foreground text-xs"
                onClick={() => toggleLogin()}
                disabled={loading}
              >
                Already have an account? Login
              </Button>
            </Link>
            <Button 
              type="submit" 
              className={`w-1/3 m-auto my-4 ${!handleConfirmPassword() ? "opacity-0" : "opacity-100"}`}
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign up"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
