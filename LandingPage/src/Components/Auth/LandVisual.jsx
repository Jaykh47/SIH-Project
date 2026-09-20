// components/Auth/LandVisual.jsx

import {
  User,
  Phone,
  Mail,
  Fingerprint,
  Map,
  MapPin,
  BuildingComplex,
  Home,
  Hash,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  LandPlot,
  Trees,
  Navigation,
  CircleCheck,
} from "lucide-react";

export default function LandVisual() {
  return (
    <section className="relative hidden overflow-hidden bg-[#20583a] lg:block">
      <div className="absolute inset-0 bg-gradient-to-br from-[#17492f] via-[#286044] to-[#397354]" />

      <div className="absolute -right-32 -top-32 h-[450px] w-[450px] rounded-full border border-white/10" />

      <div className="absolute -right-20 -top-20 h-[330px] w-[330px] rounded-full border border-white/10" />

      <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full border border-white/10" />

      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
          backgroundSize: "55px 55px",
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-evenly px-12 py-20 xl:px-16 xl:py-20">
        {/* Top label */}
        <div className="flex justify-end">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-md">
            <Navigation size={14} />
            GIS Powered Land Platform
          </div>
        </div>

        {/* MAP / CARDS */}
        <div className="relative mx-auto w-full max-w-[620px]">
          {/* Map Card */}
          <div className="relative mx-auto h-[330px] w-[90%] rounded-2xl border border-white/20 bg-[#f1f4ed] p-4 shadow-2xl">
            {/* Map Header */}
            <div className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e5efe7] text-[#286044]">
                  <Map size={20} />
                </div>

                <div>
                  <p className="text-[10px] font-bold text-[#26352c]">
                    Digital Land Map
                  </p>

                  <p className="text-[8px] text-[#849087]">
                    Cadastral Information
                  </p>
                </div>
              </div>

              <div className="rounded-md bg-[#e7f1e9] px-2 py-1 text-[10px] font-semibold text-[#286044]">
                LIVE
              </div>
            </div>

            {/* Fake GIS map */}
            <div className="relative mt-3 h-[235px] overflow-hidden rounded-xl bg-[#dce8d7]">
              <div className="absolute left-[8%] top-[12%] h-[90px] w-[27%] rotate-[-8deg] border-2 border-[#7ca17e] bg-[#c6dcbf]" />

              <div className="absolute left-[36%] top-[7%] h-[105px] w-[28%] rotate-[7deg] border-2 border-[#719b75] bg-[#d0e1c8]" />

              <div className="absolute right-[7%] top-[18%] h-[80px] w-[28%] rotate-[12deg] border-2 border-[#719b75] bg-[#bdd5b9]" />

              <div className="absolute left-[11%] bottom-[8%] h-[85px] w-[25%] rotate-[8deg] border-2 border-[#719b75] bg-[#d3e2cc]" />

              <div className="absolute left-[38%] bottom-[4%] h-[95px] w-[28%] rotate-[-5deg] border-2 border-[#719b75] bg-[#bfd7ba]" />

              <div className="absolute right-[8%] bottom-[10%] h-[85px] w-[25%] rotate-[-9deg] border-2 border-[#719b75] bg-[#d4e2cd]" />

              {/* Roads */}
              <div className="absolute left-1/2 top-0 h-full w-[9px] -translate-x-1/2 rotate-[24deg] bg-white/80" />

              <div className="absolute left-0 top-1/2 h-[8px] w-full -translate-y-1/2 rotate-[-12deg] bg-white/80" />

              {/* Pin */}
              <div className="absolute left-[48%] top-[42%] flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#286044] text-white shadow-lg">
                <MapPin size={30} />
              </div>

              <div className="absolute bottom-1 left-2 rounded-md bg-white/90 px-2 py-1 text-[8px] font-medium text-[#657168] shadow-sm">
                23.233° N
                <br />
                87.087° E
              </div>
            </div>
          </div>

          {/* Property Card */}
          <div className="absolute -left-2 top-16 w-[190px] rounded-xl bg-white p-4 shadow-xl xl:-left-6">
            <div className="flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f1e9] text-[#286044]">
                <LandPlot size={20} />
              </div>

              <span className="text-[8px] font-semibold text-[#7b897f]">
                VERIFIED
              </span>
            </div>

            <p className="mt-3 text-[10px] font-semibold text-[#26352c]">
              Land Parcel
            </p>

            <p className="mt-1 text-xl font-bold text-[#17251d]">2.45 Acres</p>

            <div className="mt-2 flex items-center gap-1 text-[9px] text-[#2c8554]">
              <CircleCheck size={11} />
              Ownership verified
            </div>
          </div>

          {/* Location Card */}
          <div className="absolute -right-2 bottom-2 w-[205px] rounded-xl bg-white p-4 shadow-xl xl:-right-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2ead8] text-[#9b7836]">
                <Trees size={20} />
              </div>

              <div>
                <p className="text-[9px] text-[#849087]">Registered Location</p>

                <p className="text-[11px] font-bold text-[#26352c]">Bankura</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-[#edf0ed] pt-3">
              <MapPin size={13} className="text-[#286044]" />

              <span className="text-[9px] text-[#718075]">
                Digital land records connected
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Content */}
        <div className="mx-auto max-w-[620px] text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#d9e7d7] backdrop-blur-md">
              <LandPlot size={30} />
            </div>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white xl:text-4xl">
            Your Land. Your Records.
            <br />
            <span className="text-[#c7ddbd]">One Digital Platform.</span>
          </h2>

          <p className="mx-auto mt-4 max-w-[500px] text-sm leading-6 text-[#d0dfd2]">
            Access transparent, secure and location-based land information
            through a unified digital land governance platform.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Feature text="GIS Mapping" />
            <Feature text="Land Records" />
            <Feature text="Secure Access" />
            <Feature text="Digital Governance" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ text }) {
  return (
    <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-medium text-[#e2ebe2] backdrop-blur-sm">
      {text}
    </div>
  );
}