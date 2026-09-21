// frontend/src/components/Auth/AuthPage.jsx
import React, { useState, useRef, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  Fingerprint,
  MapPin,
  Building2,
  Home,
  Hash,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  LandPlot,
  Zap,
} from "lucide-react";

import InputField from "./InputField";
import PasswordField from "./PasswordField";
import LandVisual from "./LandVisual";
import OtpField from "./OtpField";
import SelectField from "./SelectField";
import ThemeToggle from "../ThemeToggle";

import {
  validateField,
  validateEmail,
  sanitizePhone,
  sanitizeAadhaar,
  sanitizePincode,
  validateSignupFields,
  validateLoginFields,
} from "./Validation";

import { useLocation } from "../../hooks/useLocation";
import { sendOtp, verifyOtp } from "../../services/otpService";
import { useAuth } from "../../hooks/useAuthContext";
import authStore from "../../store/authStore";

const DEBOUNCE_MS = 400;

export default function AuthPage({ defaultTab }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const queryTab = searchParams.get("tab");
  const initialIsSignUp = defaultTab ? defaultTab === "signup" : queryTab !== "login";

  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Pre-fill email from authStore if arriving on login tab
  const [formData, setFormData] = useState(() => {
    const p = !initialIsSignUp ? authStore.getAndClearSignupData() : null;
    return {
      name: "",
      phone: "",
      email: p?.email ?? "",
      aadhaar: "",
      loginAadhaar: "",
      state: p?.state ?? "",
      stateSlug: p?.stateSlug ?? "",
      district: p?.district ?? "",
      city: "",
      pincode: "",
      password: "",
    };
  });

  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
    aadhaar: "",
    loginAadhaar: "",
    pincode: "",
    password: "",
  });

  // OTP state
  const [otpValue, setOtpValue] = useState("");
  const [otpSentCode, setOtpSentCode] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const resetOtp = () => {
    setOtpValue("");
    setOtpSentCode("");
    setOtpVerified(false);
    setOtpError("");
    setIsSending(false);
  };

  const resetForm = (prefillEmail = "") => {
    setFormData({
      name: "",
      phone: "",
      email: prefillEmail,
      aadhaar: "",
      loginAadhaar: "",
      state: "",
      stateSlug: "",
      district: "",
      city: "",
      pincode: "",
      password: "",
    });
    setErrors({
      name: "",
      phone: "",
      email: "",
      aadhaar: "",
      loginAadhaar: "",
      pincode: "",
      password: "",
    });
    setTermsAccepted(false);
    setTermsError("");
    setGeneralError("");
    resetOtp();
  };

  // Sync tab with URL search parameter
  useEffect(() => {
    const signUp = defaultTab ? defaultTab === "signup" : queryTab !== "login";
    setIsSignUp(signUp);
    setShowPassword(false);
    const pending = !signUp ? authStore.getAndClearSignupData() : null;
    if (pending?.email) {
      setFormData((prev) => ({
        ...prev,
        email: pending.email,
        state: pending.state || prev.state,
        stateSlug: pending.stateSlug || prev.stateSlug,
        district: pending.district || prev.district,
      }));
      setSuccessMessage("Account registered successfully! Please verify your OTP to sign in.");
    }
  }, [queryTab, defaultTab]);

  // Dynamic location data (States & cascading Districts)
  const { states, districts, statesLoading, districtsLoading } = useLocation(
    formData.stateSlug
  );

  const stateOptions = useMemo(
    () =>
      states.map((s) => ({
        label: s.name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
        value: s.slug,
      })),
    [states]
  );

  const districtOptions = useMemo(
    () =>
      districts.map((d) => ({
        label: d.name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
        value: d.name,
      })),
    [districts]
  );

  const debounceTimers = useRef({});

  const handleChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === "phone") value = sanitizePhone(value);
    if (name === "aadhaar") value = sanitizeAadhaar(value);
    if (name === "loginAadhaar") value = sanitizeAadhaar(value);
    if (name === "pincode") value = sanitizePincode(value);

    if (name === "stateSlug") {
      const matched = states.find((s) => s.slug === value);
      setFormData((prev) => ({
        ...prev,
        state: matched ? matched.name : value,
        stateSlug: value,
        district: "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "email") resetOtp();
    setGeneralError("");

    if (errors[name] !== undefined) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (!(name in errors)) return;
    clearTimeout(debounceTimers.current[name]);
    debounceTimers.current[name] = setTimeout(() => {
      if (!value.trim()) return;
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }, DEBOUNCE_MS);
  };

  const handleSendOtp = async () => {
    setIsSending(true);
    setOtpError("");
    try {
      const code = await sendOtp(formData.email);
      setOtpSentCode(code);
    } catch {
      setOtpError("Failed to send OTP. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const isValid = await verifyOtp(otpValue, otpSentCode, formData.email);
    if (isValid) {
      setOtpVerified(true);
      setOtpError("");
    } else {
      setOtpError("Invalid OTP. Please check and try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setSuccessMessage("");

    if (!otpVerified) {
      setOtpError(
        otpSentCode
          ? "Please verify your OTP before submitting."
          : "Please send and verify the OTP first."
      );
      return;
    }

    if (isSignUp) {
      if (!termsAccepted) {
        setTermsError("You must accept the Terms of Service and Privacy Policy.");
        return;
      }

      const newErrors = validateSignupFields(formData);
      setErrors(newErrors);
      const hasErrors = Object.values(newErrors).some((err) => err !== "");
      if (hasErrors) return;

      setSubmitting(true);
      try {
        await register({
          name: formData.name,
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          aadhaar: formData.aadhaar,
          state: formData.state,
          stateSlug: formData.stateSlug,
          district: formData.district,
          city: formData.city,
          pincode: formData.pincode,
          password: formData.password,
        });

        // Store signup details so Login tab is pre-populated
        authStore.setSignupData({
          email: formData.email,
          name: formData.name,
          state: formData.state,
          stateSlug: formData.stateSlug,
          district: formData.district,
        });

        // Navigate to login tab
        navigate("/auth?tab=login");
      } catch (err) {
        setGeneralError(err.message || err.response?.data?.error || "Registration failed.");
      } finally {
        setSubmitting(false);
      }
    } else {
      const newErrors = validateLoginFields(formData);
      setErrors(newErrors);
      const hasErrors = Object.values(newErrors).some((err) => err !== "");
      if (hasErrors) return;

      setSubmitting(true);
      try {
        const pending = authStore.getAndClearSignupData();
        const stateToSave = formData.state || pending?.state || "";
        const districtToSave = formData.district || pending?.district || "";

        await login(formData.email, formData.password, {
          aadhaar: formData.loginAadhaar,
          state: stateToSave,
          district: districtToSave,
        });

        authStore.setLoggedInUser({
          email: formData.email,
          name: pending?.name ?? "Citizen User",
          state: stateToSave,
          district: districtToSave,
        });

        navigate("/dashboard");
      } catch (err) {
        setGeneralError(err.message || err.response?.data?.error || "Login failed. Check credentials.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleTabSwitch = () => {
    navigate(isSignUp ? "/auth?tab=login" : "/auth?tab=signup");
  };

  // Demo quick-fill helper
  const fillDemo = (email, pwd, roleName, aadhaar = "9876 5432 1098") => {
    setIsSignUp(false);
    setFormData((prev) => ({
      ...prev,
      email,
      password: pwd,
      loginAadhaar: aadhaar,
    }));
    setOtpVerified(true);
    setOtpValue("1234");
    setOtpSentCode("1234");
    setOtpError("");
    setErrors({ email: "", loginAadhaar: "", password: "" });
    setGeneralError("");
  };

  const emailIsValid = validateEmail(formData.email) === "";

  return (
    <div className="min-h-screen bg-[#f7f8f4] dark:bg-[#090e0c] text-[#17251d] dark:text-[#f1f5f9] transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-[#e5eae5] dark:border-slate-800 bg-[#f7f8f4]/90 dark:bg-[#0c1310]/90 px-6 py-3.5 backdrop-blur-md lg:px-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1f5c3a] text-white shadow-md">
            <LandPlot size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight text-[#17251d] dark:text-white">
              SmartBhumi
            </h1>
            <p className="text-[9px] uppercase tracking-[1.5px] text-[#718075] dark:text-slate-400">
              Digital Land Governance
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 rounded-lg border border-[#d5ddd7] dark:border-slate-700 bg-white dark:bg-[#16221c] px-3 py-1.5 text-xs font-semibold text-[#314139] dark:text-slate-200 transition hover:bg-[#e8f0ea] dark:hover:bg-[#1f3027]"
          >
            <ArrowLeft size={14} /> Back to Home
          </button>
        </div>
      </header>

      {/* Main Grid: Left Visual + Right Form */}
      <div className="grid min-h-[calc(100vh-62px)] lg:grid-cols-2">
        {/* Left GIS Visual Panel */}
        <LandVisual />

        {/* Right Auth Form Panel */}
        <main className="flex items-center justify-center px-6 py-10 lg:px-12">
          <div className="w-full max-w-lg">
            {/* Tab switch pills */}
            <div className="mb-6 flex rounded-xl bg-[#e8ede9] dark:bg-[#16221c] p-1 shadow-inner border border-transparent dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate("/auth?tab=signup")}
                className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition ${
                  isSignUp
                    ? "bg-white dark:bg-[#203328] text-[#1f5c3a] dark:text-emerald-400 shadow-sm"
                    : "text-[#718075] dark:text-slate-400 hover:text-[#17251d] dark:hover:text-white"
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => navigate("/auth?tab=login")}
                className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition ${
                  !isSignUp
                    ? "bg-white dark:bg-[#203328] text-[#1f5c3a] dark:text-emerald-400 shadow-sm"
                    : "text-[#718075] dark:text-slate-400 hover:text-[#17251d] dark:hover:text-white"
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Title / Description */}
            <div className="mb-6">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#e8f0ea] dark:bg-[#172d21] px-3 py-1 text-xs font-semibold text-[#286044] dark:text-emerald-400 border border-transparent dark:border-emerald-800/40">
                <ShieldCheck size={13} />
                {isSignUp ? "Citizen registration portal" : "Authorized parcel access"}
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#17251d] dark:text-white">
                {isSignUp ? "Create citizen account" : "Welcome back to SmartBhumi"}
              </h2>
              <p className="mt-1 text-xs text-[#718075] dark:text-slate-400">
                {isSignUp
                  ? "Register with your regional details to access verified land parcels & maps."
                  : "Sign in with your email OTP, Aadhaar, and password."}
              </p>
            </div>

            {/* Success notification */}
            {successMessage && (
              <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
                <span>✓</span>
                <span>{successMessage}</span>
              </div>
            )}

            {/* General error notification */}
            {generalError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
                <span>⚠️</span>
                <span>{generalError}</span>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {isSignUp ? (
                /* ── SIGN UP FIELDS ─────────────────────────────────── */
                <>
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <InputField
                      label="Full Name"
                      name="name"
                      placeholder="e.g. Ramesh Kumar"
                      icon={<User size={16} />}
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      required
                    />
                    <InputField
                      label="Phone Number"
                      name="phone"
                      placeholder="10-digit mobile number"
                      icon={<Phone size={16} />}
                      value={formData.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      maxLength={11}
                      required
                    />
                  </div>

                  <InputField
                    label="Gmail / Email Address"
                    name="email"
                    type="email"
                    placeholder="example@gmail.com"
                    icon={<Mail size={16} />}
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                  />

                  {/* OTP Verification */}
                  <OtpField
                    email={formData.email}
                    emailValid={emailIsValid}
                    otpValue={otpValue}
                    onOtpChange={setOtpValue}
                    otpVerified={otpVerified}
                    otpError={otpError}
                    onSendOtp={handleSendOtp}
                    onVerifyOtp={handleVerifyOtp}
                    isSending={isSending}
                  />

                  <InputField
                    label="Aadhaar Number (12 Digits)"
                    name="aadhaar"
                    placeholder="XXXX XXXX XXXX"
                    icon={<Fingerprint size={16} />}
                    value={formData.aadhaar}
                    onChange={handleChange}
                    error={errors.aadhaar}
                    maxLength={14}
                    required
                  />

                  {/* State and District Dropdowns */}
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <SelectField
                      label="State"
                      name="stateSlug"
                      icon={<MapPin size={16} />}
                      value={formData.stateSlug}
                      onChange={handleChange}
                      options={stateOptions}
                      loading={statesLoading}
                      required
                    />

                    <SelectField
                      label="District"
                      name="district"
                      icon={<Building2 size={16} />}
                      value={formData.district}
                      onChange={handleChange}
                      options={districtOptions}
                      loading={districtsLoading}
                      disabled={!formData.stateSlug}
                      required
                    />
                  </div>

                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <InputField
                      label="City / Town / Village"
                      name="city"
                      placeholder="e.g. Durgapur"
                      icon={<Home size={16} />}
                      value={formData.city}
                      onChange={handleChange}
                    />

                    <InputField
                      label="PIN Code"
                      name="pincode"
                      placeholder="6-digit PIN"
                      icon={<Hash size={16} />}
                      value={formData.pincode}
                      onChange={handleChange}
                      error={errors.pincode}
                      maxLength={6}
                    />
                  </div>

                  <PasswordField
                    value={formData.password}
                    onChange={handleChange}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    isSignUp={true}
                    error={errors.password}
                  />

                  {/* Terms Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 text-xs text-[#526359] dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => {
                          setTermsAccepted(e.target.checked);
                          if (e.target.checked) setTermsError("");
                        }}
                        className="mt-0.5 h-4 w-4 rounded border-[#c5d1c8] dark:border-slate-700 bg-white dark:bg-[#16221c] text-[#286044] dark:text-emerald-500 focus:ring-[#286044]"
                      />
                      <span>
                        I agree to the{" "}
                        <span className="font-semibold text-[#286044] dark:text-emerald-400 hover:underline">
                          Terms of Service
                        </span>{" "}
                        and{" "}
                        <span className="font-semibold text-[#286044] dark:text-emerald-400 hover:underline">
                          Privacy Policy
                        </span>
                        .
                      </span>
                    </label>
                    {termsError && (
                      <p className="mt-1 text-[11px] font-medium text-[#d94040]">
                        {termsError}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                /* ── SIGN IN FIELDS ─────────────────────────────────── */
                <>
                  <InputField
                    label="Gmail / Email Address"
                    name="email"
                    type="email"
                    placeholder="example@gmail.com"
                    icon={<Mail size={16} />}
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                  />

                  {/* OTP Verification */}
                  <OtpField
                    email={formData.email}
                    emailValid={emailIsValid}
                    otpValue={otpValue}
                    onOtpChange={setOtpValue}
                    otpVerified={otpVerified}
                    otpError={otpError}
                    onSendOtp={handleSendOtp}
                    onVerifyOtp={handleVerifyOtp}
                    isSending={isSending}
                  />

                  <InputField
                    label="Aadhaar Number"
                    name="loginAadhaar"
                    placeholder="XXXX XXXX XXXX"
                    icon={<Fingerprint size={16} />}
                    value={formData.loginAadhaar}
                    onChange={handleChange}
                    error={errors.loginAadhaar}
                    maxLength={14}
                  />

                  <PasswordField
                    value={formData.password}
                    onChange={handleChange}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    isSignUp={false}
                    error={errors.password}
                  />

                  {/* Quick Demo Logins Helper */}
                  <div className="rounded-xl border border-emerald-100 dark:border-[#1e2f25] bg-[#f0fdf4] dark:bg-[#111f18] p-3 text-xs">
                    <div className="flex items-center justify-between text-[#286044] dark:text-emerald-400 font-semibold mb-2">
                      <span className="flex items-center gap-1.5">
                        <Zap size={13} className="text-amber-500" /> Demo Quick Logins
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                        Pre-seeded accounts
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => fillDemo("citizen@demo.com", "Citizen@123", "Citizen")}
                        className="rounded-lg bg-white dark:bg-[#162a1e] border border-emerald-200 dark:border-emerald-800/60 py-1.5 px-2 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-[#1d3527] transition"
                      >
                        Citizen
                      </button>
                      <button
                        type="button"
                        onClick={() => fillDemo("revenue@wb.gov", "Officer@123", "Revenue")}
                        className="rounded-lg bg-white dark:bg-[#1b2720] border border-slate-200 dark:border-slate-700 py-1.5 px-2 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#25362d] transition"
                      >
                        Revenue
                      </button>
                      <button
                        type="button"
                        onClick={() => fillDemo("admin@landstack.gov", "Admin@123", "Admin")}
                        className="rounded-lg bg-white dark:bg-[#272113] border border-amber-200 dark:border-amber-800/60 py-1.5 px-2 text-[10px] font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-[#382e1b] transition"
                      >
                        Admin
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!otpVerified || submitting}
                className={`group flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white shadow-sm transition mt-3 ${
                  otpVerified && !submitting
                    ? "bg-[#286044] hover:bg-[#1e4e35] hover:shadow-md active:scale-[0.99]"
                    : "bg-[#7aaa8f] dark:bg-[#244234] cursor-not-allowed opacity-70"
                }`}
              >
                {submitting
                  ? "Processing…"
                  : isSignUp
                    ? "Create Account"
                    : "Sign In"}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>

              {!otpVerified && (
                <p className="text-center text-[11px] text-[#718075] dark:text-slate-400">
                  Please verify your email OTP to enable{" "}
                  {isSignUp ? "account creation" : "sign in"}.
                </p>
              )}

              {/* Toggle Tab Footer */}
              <div className="flex items-center justify-center gap-1.5 pt-2 text-xs text-[#718075] dark:text-slate-400">
                <span>
                  {isSignUp
                    ? "Already have an account?"
                    : "Don't have an account?"}
                </span>
                <button
                  type="button"
                  onClick={handleTabSwitch}
                  className="font-bold text-[#286044] dark:text-emerald-400 hover:underline"
                >
                  {isSignUp ? "Sign In" : "Create account"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
