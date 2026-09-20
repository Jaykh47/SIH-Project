import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginModal from "./Components/Auth/LoginModal";
import {
  MapPinned,
  ShieldCheck,
  Layers3,
  Search,
  ArrowRight,
  Menu,
  X,
  Landmark,
  FileCheck2,
  Route,
  BarChart3,
  ChevronRight,
  LockKeyhole,
  Globe2,
  Users,
  Database,
  CheckCircle2,
} from "lucide-react";

const features = [
  [
    MapPinned,
    "GIS Parcel Explorer",
    "Explore georeferenced land parcels, boundaries and ULPIN-linked information on an interactive map.",
  ],
  [
    Layers3,
    "Unified Land Records",
    "Bring RoR, registration, zoning, building permissions, tax and utility information together.",
  ],
  [
    FileCheck2,
    "Verified Land Information",
    "Access a parcel-centric view designed to make ownership and land information easier to understand.",
  ],
  [
    Route,
    "Transparent Workflows",
    "Track registration, mutation, approvals and citizen service requests across departments.",
  ],
  [
    BarChart3,
    "Data-Driven Governance",
    "Use dashboards, analytics and alerts to support faster and better land administration.",
  ],
  [
    ShieldCheck,
    "Secure by Design",
    "Role-based access, authentication, audit trails and interoperable APIs support trusted services.",
  ],
];

function Logo() {
  return (
    <a href="#home" className="flex items-center gap-3">
      <div className="grid w-10 h-10 text-white rounded-xl bg-emerald-600 place-items-center">
        <MapPinned size={22} />
      </div>
      <div>
        <div className="text-xl font-extrabold">
          Smart<span className="text-emerald-600">Bhumi</span>
        </div>
        <div className="text-[9px] uppercase tracking-[.18em] text-slate-800">
          Digital Land Governance
        </div>
      </div>
    </a>
  );
}

export default function LandingPage() {
  const [menu, setMenu] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();
  const scroll = (id) => {
    setMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[74px] flex items-center justify-between">
          <Logo />
          <nav className="hidden gap-8 text-sm font-medium md:flex text-slate-600">
            {["home", "services", "about", "privacy"].map((x) => (
              <button
                key={x}
                onClick={() => scroll(x)}
                className="capitalize hover:text-emerald-700"
              >
                {x}
              </button>
            ))}
          </nav>
          <div className="hidden gap-2 md:flex">
            <button
              onClick={() => setLoginModalOpen(true)}
              className="px-4 py-2.5 rounded-lg font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/auth?tab=signup")}
              className="px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
            >
              Sign Up
            </button>
          </div>
          <button className="p-2 md:hidden" onClick={() => setMenu(!menu)}>
            {menu ? <X /> : <Menu />}
          </button>
        </div>
        {menu && (
          <div className="px-5 py-4 space-y-2 border-t md:hidden">
            {["home", "services", "about", "privacy"].map((x) => (
              <button
                key={x}
                onClick={() => scroll(x)}
                className="block w-full px-3 py-2 text-left capitalize"
              >
                {x}
              </button>
            ))}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setLoginModalOpen(true)}
                className="flex-1 py-2 border rounded-lg border-emerald-200 text-emerald-700"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/auth?tab=signup")}
                className="flex-1 py-2 text-white rounded-lg bg-emerald-600"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </header> */}

      <header className="sticky top-0 z-50 border-b border-slate-100/50 rounded-b-lg bg-white/60 backdrop-blur-md">
        <div className="mx-auto flex h-[65px] max-w-7xl items-center justify-between px-5 lg:px-8">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-1 md:flex">
            {["home", "services", "about", "privacy"].map((x) => (
              <button
                key={x}
                onClick={() => {
                  scroll(x);
                  setActiveSection(x);
                }}
                className={`relative rounded-xl px-4 py-2.5
            text-sm font-medium capitalize
           
            transition-all duration-200
            hover:bg-white
            hover:text-emerald-600
            hover:shadow-sm
            ${
              activeSection === x
                ? "text-emerald-400"
                : "text-slate-700 hover:text-emerald-600"
            }`}
              >
                {x}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={() => setLoginModalOpen(true)}
              className="
          rounded-2xl px-5 py-2.5
          text-sm font-semibold
          text-slate-700
          transition-all duration-200
          hover:bg-emerald-50
          hover:text-emerald-700
        "
            >
              Login
            </button>

            <button
              onClick={() => navigate("/auth?tab=signup")}
              className="
          rounded-2xl
          bg-emerald-600
          px-5 py-2.5
          text-sm font-semibold
          text-white
          shadow-sm shadow-emerald-600/20
          transition-all duration-200
          hover:-translate-y-0.5
          hover:bg-emerald-700
          hover:shadow-md hover:shadow-emerald-600/25
          active:translate-y-0
        "
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="
        flex h-10 w-10 items-center justify-center
        rounded-full
        border border-slate-200
        bg-white
        text-slate-800
        shadow-sm
        transition-all duration-100
        active:scale-70
        md:hidden
      "
            onClick={() => setMenu(!menu)}
            aria-label="Toggle menu"
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menu && (
          <div className="border-t border-slate-200/70 bg-white/95 px-5 py-5 shadow-lg shadow-slate-900/5 backdrop-blur-xl md:hidden">
            <div className="space-y-1">
              {["home", "services", "about", "privacy"].map((x) => (
                <button
                  key={x}
                  onClick={() => {
                    scroll(x);
                    setActiveSection(x);
                  }}
                  className={`
              block w-full rounded-xl
              px-4 py-3
              text-left text-sm font-medium
              capitalize
          
              transition-all duration-200
              hover:bg-emerald-50
              hover:pl-5
              hover:text-emerald-700
              ${
                activeSection === x
                  ? "text-emerald-400"
                  : "text-slate-600 hover:text-emerald-600"
              }
            `}
                >
                  {x}
                </button>
              ))}
            </div>

            {/* Mobile Actions */}
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setLoginModalOpen(true)}
                className="
            rounded-xl
            border border-emerald-200
            bg-white
            py-3
            text-sm font-semibold
            text-emerald-700
            transition-all duration-200
            hover:bg-emerald-50
          "
              >
                Login
              </button>

              <button
                onClick={() => navigate("/auth?tab=signup")}
                className="
            rounded-xl
            bg-emerald-600
            py-3
            text-sm font-semibold
            text-white
            shadow-sm shadow-emerald-600/20
            transition-all duration-200
            hover:bg-emerald-700
          "
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </header>

      <main id="home">
        <section className="relative overflow-hidden bg-[#f3faf7]">
          <div className="absolute -top-36 -right-24 w-[480px] h-[480px] rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-[1.08fr_.92fr] gap-14 items-center relative">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 bg-white text-emerald-700 text-xs font-bold mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />{" "}
                Integrated GIS-Based Land Governance
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] leading-[1.06] font-extrabold tracking-tight">
                One smart platform for{" "}
                <span className="text-emerald-600">every parcel.</span>
              </h1>
              <p className="max-w-2xl mt-6 text-base leading-8 lg:text-lg text-slate-600">
                SmartBhumi brings land records, maps, ownership, registration,
                planning, taxation and public services together around a single
                parcel-centric digital identity.
              </p>
              <div className="flex flex-col gap-3 mt-8 sm:flex-row">
                <button
                  onClick={() => scroll("services")}
                  className="inline-flex justify-center items-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Explore SmartBhumi <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="inline-flex justify-center items-center gap-2 px-5 py-3.5 rounded-xl bg-white border font-bold text-slate-700 hover:border-emerald-300"
                >
                  <Search size={18} /> Search a Parcel
                </button>
              </div>
              <div className="flex flex-wrap gap-5 text-xs mt-9 text-slate-500">
                {[
                  "Parcel-centric data",
                  "Interoperable APIs",
                  "Citizen-first services",
                ].map((x) => (
                  <span key={x} className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    {x}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-[26px] border border-emerald-100 bg-white p-3 shadow-2xl">
              <div className="rounded-[20px] overflow-hidden border bg-[#e9f2e9] h-[390px] relative">
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    backgroundImage:
                      "linear-gradient(#b7d1bc 1px, transparent 1px),linear-gradient(90deg,#b7d1bc 1px,transparent 1px)",
                    backgroundSize: "42px 42px",
                  }}
                />
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 600 390"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M-20 70 C100 30 130 120 220 90 S380 30 620 85"
                    fill="none"
                    stroke="#a3bdb0"
                    strokeWidth="16"
                  />
                  <path
                    d="M80 410 C130 300 190 270 280 250 S430 210 630 300"
                    fill="none"
                    stroke="#b3c7bb"
                    strokeWidth="10"
                  />
                  <polygon
                    points="65,120 185,85 230,155 160,215 65,190"
                    fill="#74b894"
                    fillOpacity=".55"
                    stroke="#176b5b"
                    strokeWidth="3"
                  />
                  <polygon
                    points="235,90 350,72 390,145 310,190 230,155"
                    fill="#9dcc9d"
                    fillOpacity=".62"
                    stroke="#176b5b"
                    strokeWidth="3"
                  />
                  <polygon
                    points="390,80 535,110 520,205 395,180"
                    fill="#b4d8a8"
                    fillOpacity=".62"
                    stroke="#176b5b"
                    strokeWidth="3"
                  />
                  <polygon
                    points="75,205 160,215 225,280 140,325 60,280"
                    fill="#a9d2a0"
                    fillOpacity=".6"
                    stroke="#176b5b"
                    strokeWidth="3"
                  />
                  <polygon
                    points="160,215 310,190 350,275 225,280"
                    fill="#63ae88"
                    fillOpacity=".45"
                    stroke="#176b5b"
                    strokeWidth="3"
                  />
                  <polygon
                    points="350,275 430,205 520,205 560,310 450,350"
                    fill="#8bc78c"
                    fillOpacity=".55"
                    stroke="#176b5b"
                    strokeWidth="3"
                  />
                  <circle cx="285" cy="150" r="9" fill="#0f8a70" />
                </svg>
                <div className="absolute px-4 py-3 shadow-lg top-4 left-4 bg-white/95 rounded-xl">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Selected Parcel
                  </div>
                  <div className="mt-1 text-sm font-extrabold">
                    ULPIN-TN-CHN-00124
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    2,450 sq ft · Residential
                  </div>
                </div>
                <div className="absolute flex gap-2 bottom-4 left-4">
                  <div className="bg-white/95 rounded-lg px-3 py-2 text-[10px] font-semibold">
                    ● Parcel
                  </div>
                  <div className="bg-white/95 rounded-lg px-3 py-2 text-[10px] font-semibold">
                    ● Utility
                  </div>
                  <div className="bg-white/95 rounded-lg px-3 py-2 text-[10px] font-semibold">
                    ● Restriction
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y">
          <div className="grid grid-cols-2 mx-auto max-w-7xl lg:grid-cols-4">
            {[
              ["12,486+", "Demo Parcels"],
              ["9+", "Department Integrations"],
              ["95.6%", "Records Digitally Linked"],
              ["24×7", "Digital Access"],
            ].map(([a, b]) => (
              <div key={b} className="px-6 border-r py-7">
                <div className="text-2xl font-extrabold">{a}</div>
                <div className="mt-1 text-xs text-slate-500">{b}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="services" className="py-20 lg:py-24">
          <div className="px-5 mx-auto max-w-7xl lg:px-8">
            <p className="text-xs uppercase tracking-[.18em] text-emerald-600 font-extrabold">
              What we provide
            </p>
            <h2 className="mt-3 text-3xl font-extrabold lg:text-4xl">
              Everything connected to the land, in one place.
            </h2>
            <p className="max-w-2xl mt-4 leading-7 text-slate-600">
              A common parcel-centric framework for citizens, land departments,
              registrars, planners and local authorities.
            </p>
            <div className="grid gap-5 mt-12 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(([Icon, title, text]) => (
                <article
                  key={title}
                  className="p-6 transition border group rounded-2xl hover:border-emerald-200 hover:shadow-xl"
                >
                  <div className="grid w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 place-items-center group-hover:bg-emerald-600 group-hover:text-white">
                    <Icon size={21} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {text}
                  </p>
                  <div className="flex items-center gap-1 mt-5 text-xs font-bold text-emerald-700">
                    Learn more <ChevronRight size={14} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="py-20 text-white bg-slate-950">
          <div className="grid items-center px-5 mx-auto max-w-7xl lg:px-8 lg:grid-cols-2 gap-14">
            <div>
              <p className="text-xs uppercase tracking-[.18em] text-emerald-400 font-extrabold">
                Why SmartBhumi
              </p>
              <h2 className="mt-3 text-3xl font-extrabold lg:text-4xl">
                From fragmented records to a connected land ecosystem.
              </h2>
              <p className="mt-5 leading-7 text-slate-300">
                SmartBhumi connects distributed land datasets while preserving
                departmental responsibilities, helping citizens and government
                teams access a consistent parcel-centric view.
              </p>
              <div className="grid gap-4 mt-8 sm:grid-cols-2">
                {[
                  [Database, "Common parcel identity"],
                  [Globe2, "Interoperable architecture"],
                  [Users, "Citizen-centric access"],
                  [Landmark, "Better governance"],
                ].map(([Icon, t]) => (
                  <div
                    key={t}
                    className="p-4 border rounded-xl border-white/10 bg-white/5"
                  >
                    <Icon className="text-emerald-400" size={19} />
                    <h4 className="mt-3 text-sm font-bold">{t}</h4>
                  </div>
                ))}
              </div>
            </div>
            <div className="border rounded-3xl border-white/10 bg-white/5 p-7">
              <div className="flex items-center gap-3 mb-5">
                <ShieldCheck className="text-emerald-400" />
                <div>
                  <div className="font-bold">Trusted digital foundation</div>
                  <div className="text-xs text-slate-400">
                    Designed for public-sector workflows
                  </div>
                </div>
              </div>
              {[
                "Role-based access control",
                "Secure authentication",
                "Department-wise data ownership",
                "Audit trails and activity history",
                "Open API-based interoperability",
                "Scalable cloud-native architecture",
              ].map((x) => (
                <div
                  key={x}
                  className="flex items-center gap-3 py-3 text-sm border-b border-white/10 last:border-0"
                >
                  <CheckCircle2 size={17} className="text-emerald-400" />
                  {x}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-5xl px-5 mx-auto">
            <div className="p-10 text-center text-white rounded-3xl bg-emerald-700">
              <p className="text-emerald-100 text-xs uppercase tracking-[.18em] font-bold">
                Start exploring
              </p>
              <h2 className="mt-3 text-3xl font-extrabold lg:text-4xl">
                Find the land information you need.
              </h2>
              <p className="mt-3 text-sm text-emerald-50/80">
                Search a demo parcel and explore how integrated land services
                can simplify governance.
              </p>
              <button
                onClick={() => setLoginModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 font-bold bg-white mt-7 text-emerald-700 rounded-xl"
              >
                Search Parcel <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </section>
      </main>
      <footer id="privacy" className="bg-[#0b211b] text-slate-300">
        <div className="grid gap-10 px-5 py-12 mx-auto max-w-7xl lg:px-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="max-w-lg mt-5 text-sm leading-6 text-slate-400">
              SmartBhumi is a prototype concept for integrated GIS-based digital
              land governance. It demonstrates how land datasets and services
              can be connected around a common parcel identity.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold text-white">
              Important Links
            </h4>
            <div className="space-y-3 text-sm">
              {["Home", "Services", "About", "Privacy Policy"].map((x) => (
                <button
                  key={x}
                  onClick={() =>
                    scroll(
                      x === "Home"
                        ? "home"
                        : x === "Services"
                          ? "services"
                          : x === "About"
                            ? "about"
                            : "privacy",
                    )
                  }
                  className="block hover:text-emerald-300"
                >
                  {x}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold text-white">
              Privacy & Security
            </h4>
            <div className="space-y-3 text-sm text-slate-400">
              <p className="flex gap-2">
                <LockKeyhole size={16} className="text-emerald-400" />{" "}
                Authorized data access
              </p>
              <p className="flex gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />{" "}
                Role-based access & auditability
              </p>
              <p className="flex gap-2">
                <FileCheck2 size={16} className="text-emerald-400" /> Demo
                records are fictional
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-5 lg:px-8 py-5 flex flex-col md:flex-row gap-3 justify-between text-[11px] text-slate-500">
            <span>© 2026 SmartBhumi · Prototype</span>
            <span>
              Privacy Policy · Terms of Use · Accessibility · Security
            </span>
          </div>
        </div>
      </footer>
      {/* ── Login Modal ── */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
}
