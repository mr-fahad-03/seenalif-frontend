"use client"
import React, { useState } from "react";
import axios from "axios";
import config from "../config/config";
import { Mail, User, Phone } from "lucide-react";
import TranslatedText from "../components/TranslatedText";

const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${config.API_URL}/api/request-callback`, form);
      setSuccess(true);
      setForm({ name: "", email: "", phone: "" });
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      alert("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e9ede7] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-[#cfd8ca] bg-white shadow-[0_20px_55px_rgba(80,94,77,0.18)]">
        <div className="grid md:grid-cols-5">
          <section className="md:col-span-2 bg-[#505e4d] p-8 text-white">
            <h2 className="text-3xl font-extrabold tracking-tight"><TranslatedText>Contact Us</TranslatedText></h2>
            <p className="mt-3 text-sm text-slate-200">
              <TranslatedText>We'd love to hear from you!</TranslatedText>
            </p>
            <div className="mt-8 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-slate-100">
              <TranslatedText>Get in touch with our support team</TranslatedText>
            </div>
          </section>

          <section className="md:col-span-3 p-6 sm:p-8">
            {success && (
              <div className="mb-6 p-4 bg-[#ecf3ea] text-[#505e4d] rounded-lg text-sm border border-[#cfd8ca]">
                <TranslatedText>Request submitted successfully!</TranslatedText>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#505e4d] mb-1"><TranslatedText>Your Name</TranslatedText></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-[#505e4d]/50" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 bg-[#f7f9f6] border border-[#d7ddd4] rounded-lg shadow-sm placeholder-[#505e4d]/45 focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d] transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#505e4d] mb-1"><TranslatedText>Your Email</TranslatedText></label>
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
                    value={form.email}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 bg-[#f7f9f6] border border-[#d7ddd4] rounded-lg shadow-sm placeholder-[#505e4d]/45 focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d] transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#505e4d] mb-1"><TranslatedText>Phone Number</TranslatedText></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-[#505e4d]/50" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-3 py-3 bg-[#f7f9f6] border border-[#d7ddd4] rounded-lg shadow-sm placeholder-[#505e4d]/45 focus:outline-none focus:ring-2 focus:ring-[#505e4d]/20 focus:border-[#505e4d] transition-colors"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#505e4d] hover:bg-[#3f4b3e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#505e4d] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? <TranslatedText>Submitting...</TranslatedText> : <TranslatedText>Send Request</TranslatedText>}
              </button>
            </form>

            <p className="text-xs text-[#505e4d]/75 text-center mt-5"><TranslatedText>We'll get back to you as soon as possible.</TranslatedText></p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
