import { useState } from "react";
import { Calendar, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PrenotaSubitoModal from "./PrenotaSubitoModal";
import BookingSheet from "./BookingSheet";
import Mascotte from "@/components/shared/Mascotte";

/**
 * PrenotaSubitoCTA — drop-in CTA block that owns the full flow:
 * 1. Renders a prominent gradient button (or full hero banner if `variant="banner"`)
 * 2. Opens PrenotaSubitoModal on click → shows 3 next slots + WhatsApp escape
 * 3. After slot pick → opens BookingSheet with registration/OTP/payment
 *
 * Variants:
 *  - "button"  → just the gradient button (use inside existing layouts)
 *  - "banner"  → full white card with title, copy, mascot, big CTA (use at end of articles / page bottoms)
 *  - "compact" → small button suitable for sidebars/sticky bars
 */
export default function PrenotaSubitoCTA({
  variant = "button",
  label = "Prenota subito",
  testid = "prenota-subito-cta",
  className = "",
  bannerTitle,
  bannerCopy,
  mascotName = "abbraccio",
}) {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [terapista, setTerapista] = useState(null);
  const [slot, setSlot] = useState(null);

  const handleConfirm = ({ terapista: t, slot: s }) => {
    setTerapista(t);
    setSlot(s);
    setModalOpen(false);
    setBookingOpen(true);
  };

  const Modal = (
    <>
      <PrenotaSubitoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
      />
      {terapista && slot && (
        <BookingSheet
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          terapista={terapista}
          slot={slot}
          currentUser={user}
        />
      )}
    </>
  );

  // ── Variant: Banner (used at end of blog posts and page bottoms) ──
  if (variant === "banner") {
    return (
      <>
        <div
          data-testid={testid}
          className={`brand-card relative p-7 lg:p-10 my-12 ${className}`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-10">
            <div className="flex-shrink-0">
              <Mascotte name={mascotName} size={110} animation="breathe" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-serif text-2xl lg:text-3xl text-[#0A0A0A] leading-tight mb-2">
                {bannerTitle || "Sei pronto a parlarne?"}
              </h3>
              <p className="text-sm lg:text-base text-[#0A0A0A]/70 leading-relaxed mb-5 max-w-xl">
                {bannerCopy ||
                  "Il primo passo è scegliere un orario. Online, riservato, senza giudizio. La prima sessione è in meno di 48 ore."}
              </p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                data-testid={`${testid}-btn`}
                className="group inline-flex items-center gap-3 px-7 py-3.5 bg-gradient-to-br from-[#F58A1F] to-[#F5D419] hover:from-[#E07A0F] hover:to-[#E5C419] text-[#0A0A0A] font-bold rounded-2xl shadow-md hover:shadow-xl text-sm tracking-wide transition-all"
              >
                <Calendar className="w-4 h-4" />
                {label}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
        {Modal}
      </>
    );
  }

  // ── Variant: Compact (sidebars, sticky elements) ──
  if (variant === "compact") {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          data-testid={`${testid}-btn`}
          className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-[#F58A1F] to-[#F5D419] hover:from-[#E07A0F] hover:to-[#E5C419] text-[#0A0A0A] font-bold rounded-xl shadow hover:shadow-md text-xs tracking-wide transition-all ${className}`}
        >
          <Calendar className="w-3.5 h-3.5" /> {label}
        </button>
        {Modal}
      </>
    );
  }

  // ── Variant: Link (inline underlined link with orange decoration) ──
  if (variant === "link") {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          data-testid={`${testid}-btn`}
          className={`text-sm text-[#0A0A0A] font-medium underline underline-offset-4 decoration-[#F58A1F] decoration-2 hover:decoration-4 transition-all ${className}`}
        >
          {label}
        </button>
        {Modal}
      </>
    );
  }

  // ── Variant: Button (default — standalone prominent button) ──
  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        data-testid={`${testid}-btn`}
        className={`group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-br from-[#F58A1F] to-[#F5D419] hover:from-[#E07A0F] hover:to-[#E5C419] text-[#0A0A0A] font-bold rounded-2xl shadow-md hover:shadow-lg tracking-wide transition-all ${className}`}
      >
        <Calendar className="w-4 h-4" />
        {label}
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </button>
      {Modal}
    </>
  );
}
