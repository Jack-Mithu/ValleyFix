"use client";
import Link from "next/link";

import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileImage,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Upload,
  User,
  Wrench,
  X,
} from "lucide-react";

const steps = [
  "Account",
  "Professional",
  "Verification",
  "Address",
  "Services",
  "Areas",
  "Availability",
  "Review",
];

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type AvailabilityDay = {
  enabled: boolean;
  startTime: string;
  endTime: string;
};

type TechnicianFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  bio: string;
  niNumber: string;
  idProof: File | null;
  profilePicture: File | null;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  country: string;
  services: string[];
  serviceAreas: string[];
  availability: Record<string, AvailabilityDay>;
};

const initialAvailability: Record<string, AvailabilityDay> =
  Object.fromEntries(
    weekdays.map((day) => [
      day,
      {
        enabled: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(
          day,
        ),
        startTime: "09:00",
        endTime: "17:00",
      },
    ]),
  );

const initialFormData: TechnicianFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  bio: "",
  niNumber: "",
  idProof: null,
  profilePicture: null,
  addressLine1: "",
  addressLine2: "",
  city: "",
  postcode: "",
  country: "United Kingdom",
  services: [],
  serviceAreas: [],
  availability: initialAvailability,
};

// Temporary UI options.
// These names must match the seeded data in backend/prisma/seed.ts.
// Replace them with records retrieved from the ValleyFix API later.
const availableServices = [
  "Plumbing",
  "Electrical work",
  "Cleaning",
  "Gardening",
  "Painting and decorating",
  "Handyman services",
];

const availableAreas = [
  "Cardiff",
  "Bridgend",
  "Swansea",
  "Maesteg",
];

export default function TechnicianRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] =
    useState<TechnicianFormData>(initialFormData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateField = (
    name: keyof TechnicianFormData,
    value: string,
  ) => {
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const toggleSelection = (
    field: "services" | "serviceAreas",
    value: string,
  ) => {
    setFormData((previous) => {
      const current = previous[field];

      return {
        ...previous,
        [field]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const updateAvailability = (
    day: string,
    field: keyof AvailabilityDay,
    value: boolean | string,
  ) => {
    setFormData((previous) => ({
      ...previous,
      availability: {
        ...previous.availability,
        [day]: {
          ...previous.availability[day],
          [field]: value,
        },
      },
    }));
  };

  const validateStep = (): boolean => {
    setError("");

    switch (currentStep) {
      case 0:
        if (
          !formData.firstName.trim() ||
          !formData.lastName.trim() ||
          !formData.email.trim() ||
          !formData.phone.trim() ||
          !formData.password ||
          !formData.confirmPassword
        ) {
          setError("Please complete all required account fields.");
          return false;
        }

        if (formData.password.length < 8 || formData.password.length > 72) {
          setError("Your password must contain between 8 and 72 characters.");
          return false;
        }

        if (formData.password !== formData.confirmPassword) {
          setError("Your passwords do not match.");
          return false;
        }

        return true;

      case 1:
        if (!formData.bio.trim()) {
          setError("Please provide your professional biography.");
          return false;
        }

        return true;

      case 2:
        if (!formData.niNumber.trim()) {
          setError("Please enter your National Insurance number.");
          return false;
        }

        if (!formData.idProof || !formData.profilePicture) {
          setError("Please upload your identity proof and profile picture.");
          return false;
        }

        return true;

      case 3:
        if (
          !formData.addressLine1.trim() ||
          !formData.city.trim() ||
          !formData.postcode.trim() ||
          !formData.country.trim()
        ) {
          setError("Please complete all required address fields.");
          return false;
        }

        return true;

      case 4:
        if (formData.services.length === 0) {
          setError("Select at least one service you can provide.");
          return false;
        }

        return true;

      case 5:
        if (formData.serviceAreas.length === 0) {
          setError("Select at least one area where you can work.");
          return false;
        }

        return true;

      case 6: {
        const selectedDays = Object.entries(formData.availability).filter(
          ([, value]) => value.enabled,
        );

        if (selectedDays.length === 0) {
          setError("Select at least one day you are available to work.");
          return false;
        }

        const invalidDay = selectedDays.some(
          ([, value]) => value.startTime >= value.endTime,
        );

        if (invalidDay) {
          setError("Each working day's end time must be after its start time.");
          return false;
        }

        return true;
      }

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep()) return;

    setCurrentStep((previous) => Math.min(previous + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const previousStep = () => {
    setError("");
    setCurrentStep((previous) => Math.max(previous - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateStep()) return;

    setLoading(true);
    setError("");

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

      if (!apiBaseUrl) {
        throw new Error("The API URL is not configured. Please contact support.");
      }

      if (!formData.idProof || !formData.profilePicture) {
        throw new Error("Please upload your identity proof and profile picture.");
      }

      // Files can't be sent as JSON, so this is multipart/form-data.
      // Lists and objects travel as JSON strings; the backend parses them.
      // (Don't set Content-Type yourself: the browser adds the boundary.)
      const body = new FormData();
      body.append("firstName", formData.firstName.trim());
      body.append("lastName", formData.lastName.trim());
      body.append("email", formData.email.trim().toLowerCase());
      body.append("phone", formData.phone.trim());
      body.append("password", formData.password);
      body.append("bio", formData.bio.trim());
      body.append("niNumber", formData.niNumber.trim().toUpperCase());
      body.append("addressLine1", formData.addressLine1.trim());
      if (formData.addressLine2.trim()) {
        body.append("addressLine2", formData.addressLine2.trim());
      }
      body.append("city", formData.city.trim());
      body.append("postcode", formData.postcode.trim().toUpperCase());
      body.append("country", formData.country.trim());
      body.append("services", JSON.stringify(formData.services));
      body.append("serviceAreas", JSON.stringify(formData.serviceAreas));
      body.append("availability", JSON.stringify(formData.availability));
      body.append("idProof", formData.idProof);
      body.append("profilePicture", formData.profilePicture);

      const response = await fetch(`${apiBaseUrl}/auth/register/technician`, {
        method: "POST",
        body,
      });

      const data: { message?: string | string[] } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        const message = Array.isArray(data.message)
          ? data.message.join(" ")
          : data.message;
        throw new Error(
          message ||
            `Unable to submit your application (status ${response.status}).`,
        );
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your application. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-oxford-900 outline-none transition placeholder:text-slate-400 focus:border-oxford-600 focus:ring-4 focus:ring-oxford-600/10";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700";

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-12"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold-50">
            <CheckCircle2 size={44} className="text-marigold-800" />
          </div>

          <h1 className="mt-7 text-3xl font-bold text-oxford-900">
            Application ready!
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            Your application has passed the frontend checks. Once we connect
            the backend, you will be able to submit it for official review.
          </p>

          <div className="mt-7 rounded-2xl border border-gold-200 bg-gold-50 p-5 text-left">
            <div className="flex items-start gap-3">
              <Clock size={21} className="mt-0.5 text-marigold-800" />

              <div>
                <h2 className="font-semibold text-marigold-900">
                  Admin approval required
                </h2>

                <p className="mt-1 text-sm leading-6 text-marigold-800">
                  Technicians must be approved by the ValleyFix team before
                  they can operate on the platform.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-oxford-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-oxford-700"
          >
            Return home
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-oxford-900 text-xl font-bold text-gold-400">
              V
            </div>

            <span className="text-2xl font-bold text-oxford-900">
              Valley<span className="text-marigold-600">Fix</span>
            </span>
          </Link>

          <Link
            href="/login"
            className="text-sm font-semibold text-oxford-900 hover:text-oxford-700"
          >
            Sign in
          </Link>
        </div>
      </header>

      <section className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-oxford-900"
          >
            <ArrowLeft size={17} />
            Back to account types
          </Link>

          <div className="mt-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold-50 px-3 py-1.5 text-sm font-semibold text-marigold-900">
              <Wrench size={16} />
              Technician application
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-oxford-900 sm:text-4xl">
              Join the ValleyFix network
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Complete the steps below to tell us about your services,
              working areas and availability.
            </p>
          </div>

          {/* Progress */}
          <div className="mt-9 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-600">
                  STEP {currentStep + 1} OF {steps.length}
                </p>

                <h2 className="mt-1 text-lg font-bold text-oxford-900">
                  {steps[currentStep]}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-oxford-50 text-sm font-bold text-oxford-700">
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-oxford-900"
                initial={false}
                animate={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="mt-5 hidden grid-cols-8 gap-2 md:grid">
              {steps.map((step, index) => (
                <div key={step} className="text-center">
                  <div
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      index < currentStep
                        ? "bg-gold-400 text-oxford-900"
                        : index === currentStep
                          ? "bg-oxford-900 text-white"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {index < currentStep ? <Check size={15} /> : index + 1}
                  </div>

                  <p
                    className={`mt-2 text-xs ${
                      index === currentStep
                        ? "font-semibold text-oxford-700"
                        : "text-slate-600"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6">
            <AnimatePresence mode="wait">
              <motion.section
                key={currentStep}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
              >
                {/* STEP 1: ACCOUNT */}
                {currentStep === 0 && (
                  <>
                    <StepHeading
                      icon={<User size={21} />}
                      title="Account information"
                      description="Create the account you will use to manage your professional services."
                    />

                    <div className="mt-7 grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className={labelClass}>
                          First name *
                        </label>

                        <input
                          id="firstName"
                          autoComplete="given-name"
                          value={formData.firstName}
                          onChange={(e) =>
                            updateField("firstName", e.target.value)
                          }
                          className={inputClass}
                          placeholder="First name"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="lastName" className={labelClass}>
                          Last name *
                        </label>

                        <input
                          id="lastName"
                          autoComplete="family-name"
                          value={formData.lastName}
                          onChange={(e) =>
                            updateField("lastName", e.target.value)
                          }
                          className={inputClass}
                          placeholder="Last name"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className={labelClass}>
                          Email address *
                        </label>

                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={(e) =>
                            updateField("email", e.target.value)
                          }
                          className={inputClass}
                          placeholder="you@example.com"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className={labelClass}>
                          Phone number *
                        </label>

                        <input
                          id="phone"
                          type="tel"
                          autoComplete="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            updateField("phone", e.target.value)
                          }
                          className={inputClass}
                          placeholder="+44 7123 456789"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="password" className={labelClass}>
                          Password *
                        </label>

                        <input
                          id="password"
                          type="password"
                          autoComplete="new-password"
                          value={formData.password}
                          onChange={(e) =>
                            updateField("password", e.target.value)
                          }
                          className={inputClass}
                          minLength={8}
                          maxLength={72}
                          placeholder="At least 8 characters"
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className={labelClass}
                        >
                          Confirm password *
                        </label>

                        <input
                          id="confirmPassword"
                          type="password"
                          autoComplete="new-password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            updateField("confirmPassword", e.target.value)
                          }
                          className={inputClass}
                          minLength={8}
                          maxLength={72}
                          placeholder="Enter password again"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 2: PROFESSIONAL */}
                {currentStep === 1 && (
                  <>
                    <StepHeading
                      icon={<Wrench size={21} />}
                      title="Professional information"
                      description="Introduce yourself and describe your professional services."
                    />

                    <div className="mt-7">
                      <label htmlFor="bio" className={labelClass}>
                        Professional biography *
                      </label>

                      <textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => updateField("bio", e.target.value)}
                        rows={7}
                        maxLength={2000}
                        required
                        placeholder="Tell customers about your services, the type of work you undertake and how you approach your work."
                        className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-oxford-900 outline-none transition placeholder:text-slate-400 focus:border-oxford-600 focus:ring-4 focus:ring-oxford-600/10"
                      />

                      <p className="mt-2 text-right text-xs text-slate-400">
                        {formData.bio.length}/2000 characters
                      </p>
                    </div>
                  </>
                )}

                {/* STEP 3: VERIFICATION */}
                {currentStep === 2 && (
                  <>
                    <StepHeading
                      icon={<ShieldCheck size={21} />}
                      title="Identity verification"
                      description="Provide the requested identity details for confidential review by the ValleyFix team."
                    />

                    <div className="mt-7 space-y-6">
                      <div>
                        <label htmlFor="niNumber" className={labelClass}>
                          National Insurance number *
                        </label>

                        <input
                          id="niNumber"
                          value={formData.niNumber}
                          onChange={(e) =>
                            updateField(
                              "niNumber",
                              e.target.value.toUpperCase(),
                            )
                          }
                          className={inputClass}
                          placeholder="e.g. QQ 12 34 56 C"
                          autoComplete="off"
                          required
                        />

                        <p className="mt-2 text-xs leading-5 text-slate-600">
                          This is sensitive personal information. In production,
                          it must be transmitted securely and kept private.
                        </p>
                      </div>

                      <FileUpload
                        id="idProof"
                        label="Identity proof *"
                        description="Upload the identity document requested by ValleyFix."
                        accept="image/*,.pdf"
                        file={formData.idProof}
                        onChange={(file) =>
                          setFormData((previous) => ({
                            ...previous,
                            idProof: file,
                          }))
                        }
                      />

                      <FileUpload
                        id="profilePicture"
                        label="Profile picture *"
                        description="Choose a clear photo for your technician profile."
                        accept="image/*"
                        file={formData.profilePicture}
                        onChange={(file) =>
                          setFormData((previous) => ({
                            ...previous,
                            profilePicture: file,
                          }))
                        }
                      />

                      <div className="flex items-start gap-3 rounded-xl bg-oxford-50 p-4">
                        <LockKeyhole
                          size={19}
                          className="mt-0.5 shrink-0 text-oxford-700"
                        />

                        <p className="text-sm leading-6 text-oxford-950">
                          These documents must be stored privately and made
                          accessible only to authorised personnel.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 4: ADDRESS */}
                {currentStep === 3 && (
                  <>
                    <StepHeading
                      icon={<MapPin size={21} />}
                      title="Your address"
                      description="Provide the address associated with your technician profile."
                    />

                    <div className="mt-7 grid gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="addressLine1" className={labelClass}>
                          Address line 1 *
                        </label>

                        <input
                          id="addressLine1"
                          autoComplete="address-line1"
                          value={formData.addressLine1}
                          onChange={(e) =>
                            updateField("addressLine1", e.target.value)
                          }
                          className={inputClass}
                          placeholder="House number and street"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="addressLine2" className={labelClass}>
                          Address line 2
                        </label>

                        <input
                          id="addressLine2"
                          autoComplete="address-line2"
                          value={formData.addressLine2}
                          onChange={(e) =>
                            updateField("addressLine2", e.target.value)
                          }
                          className={inputClass}
                          placeholder="Flat or additional details (optional)"
                        />
                      </div>

                      <div>
                        <label htmlFor="city" className={labelClass}>
                          City or town *
                        </label>

                        <input
                          id="city"
                          autoComplete="address-level2"
                          value={formData.city}
                          onChange={(e) => updateField("city", e.target.value)}
                          className={inputClass}
                          placeholder="e.g. Cardiff"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="postcode" className={labelClass}>
                          Postcode *
                        </label>

                        <input
                          id="postcode"
                          autoComplete="postal-code"
                          value={formData.postcode}
                          onChange={(e) =>
                            updateField("postcode", e.target.value)
                          }
                          className={inputClass}
                          placeholder="e.g. CF10 1AA"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="country" className={labelClass}>
                          Country *
                        </label>

                        <select
                          id="country"
                          autoComplete="country-name"
                          value={formData.country}
                          onChange={(e) =>
                            updateField("country", e.target.value)
                          }
                          className={inputClass}
                          required
                        >
                          <option value="United Kingdom">
                            United Kingdom
                          </option>
                          <option value="Ireland">Ireland</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 5: SERVICES */}
                {currentStep === 4 && (
                  <>
                    <StepHeading
                      icon={<Wrench size={21} />}
                      title="Services you provide"
                      description="Select every service you are prepared to undertake."
                    />

                    <p className="mt-6 text-sm text-slate-600">
                      Select at least one service.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {availableServices.map((service) => {
                        const selected = formData.services.includes(service);

                        return (
                          <button
                            key={service}
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              toggleSelection("services", service)
                            }
                            className={`flex min-h-16 items-center justify-between gap-3 rounded-xl border p-4 text-left text-sm font-semibold transition ${
                              selected
                                ? "border-oxford-600 bg-oxford-50 text-oxford-800"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            {service}

                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                                selected
                                  ? "bg-oxford-900 text-white"
                                  : "border border-slate-300"
                              }`}
                            >
                              {selected && <Check size={14} />}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <p className="mt-5 text-xs leading-5 text-slate-600">
                      These are temporary demonstration options. We will
                      retrieve the actual active services from the backend
                      when the API is ready.
                    </p>
                  </>
                )}

                {/* STEP 6: AREAS */}
                {currentStep === 5 && (
                  <>
                    <StepHeading
                      icon={<MapPin size={21} />}
                      title="Your service areas"
                      description="Choose the areas in which you are willing to accept work."
                    />

                    <p className="mt-6 text-sm text-slate-600">
                      Select all applicable areas.
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {availableAreas.map((area) => {
                        const selected = formData.serviceAreas.includes(area);

                        return (
                          <button
                            key={area}
                            type="button"
                            aria-pressed={selected}
                            onClick={() =>
                              toggleSelection("serviceAreas", area)
                            }
                            className={`flex min-h-16 items-center justify-between gap-3 rounded-xl border p-4 text-left text-sm font-semibold transition ${
                              selected
                                ? "border-marigold-500 bg-gold-50 text-marigold-900"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <MapPin size={18} />
                              {area}
                            </span>

                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                                selected
                                  ? "bg-gold-400 text-oxford-900"
                                  : "border border-slate-300"
                              }`}
                            >
                              {selected && <Check size={14} />}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <p className="mt-5 text-xs leading-5 text-slate-600">
                      These are placeholder options for the frontend. The
                      production form will use the service areas configured
                      in ValleyFix.
                    </p>
                  </>
                )}

                {/* STEP 7: AVAILABILITY */}
                {currentStep === 6 && (
                  <>
                    <StepHeading
                      icon={<Clock size={21} />}
                      title="Working availability"
                      description="Choose your regular working days and times."
                    />

                    <div className="mt-6 space-y-3">
                      {weekdays.map((day) => {
                        const availability = formData.availability[day];

                        return (
                          <div
                            key={day}
                            className={`rounded-xl border p-4 transition ${
                              availability.enabled
                                ? "border-oxford-200 bg-oxford-50/50"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <label className="flex cursor-pointer items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={availability.enabled}
                                  onChange={(e) =>
                                    updateAvailability(
                                      day,
                                      "enabled",
                                      e.target.checked,
                                    )
                                  }
                                  className="h-4 w-4 rounded border-slate-300 text-oxford-900 focus:ring-oxford-600"
                                />

                                <span className="text-sm font-semibold text-slate-800">
                                  {day}
                                </span>
                              </label>

                              {!availability.enabled && (
                                <span className="text-xs text-slate-400">
                                  Not available
                                </span>
                              )}
                            </div>

                            {availability.enabled && (
                              <div className="mt-4 grid grid-cols-2 gap-3 pl-7">
                                <div>
                                  <label
                                    htmlFor={`${day}-start`}
                                    className="mb-2 block text-xs font-semibold text-slate-600"
                                  >
                                    Start time
                                  </label>

                                  <input
                                    id={`${day}-start`}
                                    type="time"
                                    value={availability.startTime}
                                    onChange={(e) =>
                                      updateAvailability(
                                        day,
                                        "startTime",
                                        e.target.value,
                                      )
                                    }
                                    className={inputClass}
                                    required
                                  />
                                </div>

                                <div>
                                  <label
                                    htmlFor={`${day}-end`}
                                    className="mb-2 block text-xs font-semibold text-slate-600"
                                  >
                                    End time
                                  </label>

                                  <input
                                    id={`${day}-end`}
                                    type="time"
                                    value={availability.endTime}
                                    onChange={(e) =>
                                      updateAvailability(
                                        day,
                                        "endTime",
                                        e.target.value,
                                      )
                                    }
                                    className={inputClass}
                                    required
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* STEP 8: REVIEW */}
                {currentStep === 7 && (
                  <>
                    <StepHeading
                      icon={<FileCheck2 size={21} />}
                      title="Review your application"
                      description="Check your details before continuing."
                    />

                    <div className="mt-7 space-y-6">
                      <ReviewSection
                        title="Account information"
                        onEdit={() => setCurrentStep(0)}
                      >
                        <ReviewRow
                          label="Name"
                          value={`${formData.firstName} ${formData.lastName}`}
                        />
                        <ReviewRow label="Email" value={formData.email} />
                        <ReviewRow label="Phone" value={formData.phone} />
                      </ReviewSection>

                      <ReviewSection
                        title="Professional information"
                        onEdit={() => setCurrentStep(1)}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                          {formData.bio}
                        </p>
                      </ReviewSection>

                      <ReviewSection
                        title="Identity verification"
                        onEdit={() => setCurrentStep(2)}
                      >
                        <ReviewRow
                          label="National Insurance number"
                          value="Provided"
                        />
                        <ReviewRow
                          label="Identity proof"
                          value={formData.idProof?.name ?? "Not uploaded"}
                        />
                        <ReviewRow
                          label="Profile picture"
                          value={
                            formData.profilePicture?.name ?? "Not uploaded"
                          }
                        />
                      </ReviewSection>

                      <ReviewSection
                        title="Address"
                        onEdit={() => setCurrentStep(3)}
                      >
                        <p className="text-sm leading-6 text-slate-600">
                          {formData.addressLine1}
                          {formData.addressLine2 &&
                            `, ${formData.addressLine2}`}
                          <br />
                          {formData.city}, {formData.postcode}
                          <br />
                          {formData.country}
                        </p>
                      </ReviewSection>

                      <ReviewSection
                        title="Services offered"
                        onEdit={() => setCurrentStep(4)}
                      >
                        <TagList items={formData.services} />
                      </ReviewSection>

                      <ReviewSection
                        title="Service areas"
                        onEdit={() => setCurrentStep(5)}
                      >
                        <TagList items={formData.serviceAreas} />
                      </ReviewSection>

                      <ReviewSection
                        title="Availability"
                        onEdit={() => setCurrentStep(6)}
                      >
                        <div className="space-y-2">
                          {weekdays
                            .filter(
                              (day) => formData.availability[day].enabled,
                            )
                            .map((day) => (
                              <ReviewRow
                                key={day}
                                label={day}
                                value={`${formData.availability[day].startTime} – ${formData.availability[day].endTime}`}
                              />
                            ))}
                        </div>
                      </ReviewSection>

                      <div className="rounded-xl border border-gold-200 bg-gold-50 p-4">
                        <p className="text-sm leading-6 text-marigold-900">
                          By submitting, you acknowledge that your application
                          must be reviewed by ValleyFix. You cannot accept
                          bookings until the required approval is granted.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Error */}
                {error && (
                  <div
                    role="alert"
                    className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    <X size={18} className="mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                {/* Navigation */}
                <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row">
                  <button
                    type="button"
                    onClick={previousStep}
                    disabled={currentStep === 0 || loading}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft size={17} />
                    Previous
                  </button>

                  {currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-oxford-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-oxford-900/20 transition hover:bg-oxford-700"
                    >
                      Continue
                      <ArrowRight size={17} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gold-400 px-6 py-3 text-sm font-bold text-oxford-900 shadow-lg shadow-gold-500/20 transition hover:bg-marigold-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Checking application..." : "Submit application"}
                      {!loading && <CheckCircle2 size={18} />}
                    </button>
                  )}
                </div>
              </motion.section>
            </AnimatePresence>
          </form>

          <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-5 text-slate-600">
            Your documents are used only to verify your identity and are
            reviewed by the ValleyFix team before your account is approved.
          </p>
        </div>
      </section>
    </main>
  );
}

function StepHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-oxford-50 text-oxford-900">
        {icon}
      </div>

      <div>
        <h2 className="text-xl font-bold text-oxford-900">{title}</h2>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
}

function FileUpload({
  id,
  label,
  description,
  accept,
  file,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <label
        htmlFor={id}
        className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-oxford-400 hover:bg-oxford-50/40"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-oxford-900 shadow-sm">
          {file ? <FileImage size={23} /> : <Upload size={23} />}
        </div>

        <span className="mt-3 text-sm font-semibold text-slate-800">
          {file ? file.name : "Choose a file to upload"}
        </span>

        <span className="mt-1 text-xs leading-5 text-slate-600">
          {file
            ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
            : description}
        </span>

        <input
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0] ?? null;

            if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
              window.alert("Please choose a file smaller than 5 MB.");
              e.target.value = "";
              onChange(null);
              return;
            }

            onChange(selectedFile);
          }}
        />
      </label>

      {file && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700"
        >
          Remove file
        </button>
      )}

      <p className="mt-2 text-xs text-slate-400">
        Maximum file size: 5 MB.
      </p>
    </div>
  );
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-bold text-oxford-900">{title}</h3>

        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-semibold text-oxford-900 hover:text-oxford-700"
        >
          Edit
        </button>
      </div>

      {children}
    </section>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-1 py-1 sm:flex-row sm:gap-4">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="break-all text-sm font-medium text-slate-800 sm:text-right">
        {value}
      </span>
    </div>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-oxford-50 px-3 py-1.5 text-sm font-medium text-oxford-800"
        >
          {item}
        </span>
      ))}
    </div>
  );
}