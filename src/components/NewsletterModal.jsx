import React, { useState } from "react";
import axios from "axios";
import { Bell, Tag, Calendar } from "lucide-react";

const options = [
  { label: "All Updates", value: "all", icon: <Bell className="inline mr-2 w-4 h-4" /> },
  { label: "Promotions Only", value: "promotions", icon: <Tag className="inline mr-2 w-4 h-4" /> },
  { label: "Events Only", value: "events", icon: <Calendar className="inline mr-2 w-4 h-4" /> },
];

const NewsletterModal = ({ email, onClose }) => {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSelect = (value) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/newsletter/subscribe", {
        email,
        preferences: selected,
      });
      setSuccess(true);
    } catch (err) {
      setError("Failed to subscribe. Please try again.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2820]/60 backdrop-blur-[2px] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#d7ddd4] bg-white p-6 shadow-[0_20px_50px_rgba(28,39,30,0.28)]">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Thank you for subscribing!</h2>
          <p className="mt-2 text-sm text-slate-600">A confirmation email has been sent to {email}.</p>
          <button
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#505e4d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#465342] transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2820]/60 backdrop-blur-[2px] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#d7ddd4] bg-white p-6 shadow-[0_20px_50px_rgba(28,39,30,0.28)]">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Newsletter Preferences</h2>
        <p className="mt-1 text-sm text-slate-600">Choose what type of updates you want to receive.</p>

        <form onSubmit={handleSubmit}>
          <div className="mt-4 space-y-2.5">
            {options.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-center rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                  selected.includes(opt.value)
                    ? "border-[#505e4d] bg-[#edf1eb] text-[#2f3b2d]"
                    : "border-[#d7ddd4] bg-[#f9fbf8] text-slate-700 hover:border-[#b8c2b3]"
                }`}
              >
                <input
                  type="checkbox"
                  value={opt.value}
                  checked={selected.includes(opt.value)}
                  onChange={() => handleSelect(opt.value)}
                  className="mr-2.5 accent-[#505e4d]"
                />
                {opt.icon}
                {opt.label}
              </label>
            ))}
          </div>

          {error && <div className="mt-3 text-sm text-red-500">{error}</div>}

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-xl border border-[#d5dbd2] bg-[#f4f6f3] px-4 py-2.5 text-sm font-semibold text-[#42513f] hover:bg-[#e9eee6] transition-colors"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#505e4d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#465342] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading || selected.length === 0}
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsletterModal; 
