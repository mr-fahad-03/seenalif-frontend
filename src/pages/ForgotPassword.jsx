import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { Mail } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Convert email to lowercase before sending
      await authAPI.forgotPassword(email.trim().toLowerCase());
      setSuccess("If this email is registered, a reset link has been sent.");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e9ede7] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-[#cfd8ca] bg-white shadow-[0_20px_55px_rgba(80,94,77,0.18)]">
        <div className="grid md:grid-cols-5">
          <section className="md:col-span-2 bg-[#505e4d] p-8 text-white">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 border border-white/20 mb-6">
              <Mail className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">Forgot Password</h2>
            <p className="mt-3 text-sm text-slate-200">
              Enter your email to receive a secure reset link and recover your account.
            </p>
            <div className="mt-8 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-slate-100">
              Password recovery portal
            </div>
          </section>

          <section className="md:col-span-3 p-6 sm:p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-[#edf1eb] text-[#505e4d] rounded-lg text-sm border border-[#c7cec2]">{success}</div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#505e4d] mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-[#505e4d]/50" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-3 bg-[#f7f9f6] border border-[#d7ddd4] rounded-lg shadow-sm placeholder-[#505e4d]/45 focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d] transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#505e4d] hover:bg-[#3f4b3e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#505e4d] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <button
              className="mt-5 text-sm text-[#505e4d] hover:text-[#3f4b3e] transition-colors"
              onClick={() => navigate("/login")}
            >
              Back to Sign In
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
