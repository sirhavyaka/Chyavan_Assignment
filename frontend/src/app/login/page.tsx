"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<"login" | "register">(
    searchParams.get("mode") === "register" ? "register" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [coldStartNotice, setColdStartNotice] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setTimeout(() => {
        setColdStartNotice(true);
      }, 3500);
    } else {
      setColdStartNotice(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (mode === "register") {
        await register(email, name, password);
        showToast("Welcome to Airbnb! 🎉", "success");
      } else {
        await login(email, password);
        showToast("Welcome back!", "success");
      }
      router.push("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      showToast(msg, "error");
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-var(--header-height)-200px)] py-12 px-4">
      <div className="w-full max-w-[440px] border border-border rounded-xl overflow-hidden shadow-sm bg-bg-primary">
        <div className="px-6 pt-6 pb-2 text-center border-b border-border">
          <h1 className="text-xl font-semibold mb-1">{mode === "login" ? "Log in" : "Sign up"}</h1>
          <p className="text-sm text-text-secondary pb-4">Welcome to Airbnb</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {mode === "register" && (
            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                className="input"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              className="input"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              className="input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? (coldStartNotice ? "Waking server up (~30s)..." : "Please wait...") : mode === "login" ? "Log in" : "Sign up"}
          </button>
          {loading && coldStartNotice && (
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-2 px-2 animate-fadeIn">
              ⏳ First request wakes up the free-tier Render server. Thank you for waiting!
            </p>
          )}
        </form>

        <div className="flex items-center gap-4 px-6 text-text-secondary text-xs">
          <div className="flex-1 h-px bg-border" />
          <span>or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Quick login buttons for demo */}
        <div className="px-6 py-4 flex flex-col gap-2">
          <p className="text-xs text-text-secondary text-center mb-1">Quick demo login:</p>
          <button
            className="btn btn-secondary btn-block text-left justify-start"
            disabled={loading}
            onClick={async () => {
              if (loading) return;
              setLoading(true);
              try {
                await login("alice@example.com", "password123");
                showToast("Logged in as Alice (Superhost) 🏠", "success");
                router.push("/");
              } catch { showToast("Login failed", "error"); setLoading(false); }
            }}
          >
            🏠 Alice (Superhost)
          </button>
          <button
            className="btn btn-secondary btn-block text-left justify-start"
            disabled={loading}
            onClick={async () => {
              if (loading) return;
              setLoading(true);
              try {
                await login("bob@example.com", "password123");
                showToast("Logged in as Bob (Host)", "success");
                router.push("/");
              } catch { showToast("Login failed", "error"); setLoading(false); }
            }}
          >
            🔑 Bob (Host)
          </button>
          <button
            className="btn btn-secondary btn-block text-left justify-start"
            disabled={loading}
            onClick={async () => {
              if (loading) return;
              setLoading(true);
              try {
                await login("charlie@example.com", "password123");
                showToast("Logged in as Charlie (Guest)", "success");
                router.push("/");
              } catch { showToast("Login failed", "error"); setLoading(false); }
            }}
          >
            ✈️ Charlie (Guest)
          </button>
        </div>

        <div className="px-6 pt-4 pb-6 text-center text-sm text-text-secondary border-t border-border">
          {mode === "login" ? (
            <p>
              Don&apos;t have an account?{" "}
              <button className="text-primary font-semibold underline bg-transparent border-none cursor-pointer" onClick={() => setMode("register")}>Sign up</button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button className="text-primary font-semibold underline bg-transparent border-none cursor-pointer" onClick={() => setMode("login")}>Log in</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center pt-30">
        <div className="skeleton w-[440px] h-[500px] rounded-xl" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
