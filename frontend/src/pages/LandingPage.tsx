import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Printer,
  Sparkles,
  Zap,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  FileText,
  CreditCard,
  Lock,
  ChevronRight,
  HelpCircle,
  QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchRole } = useAuth();

  const handleLaunchApp = async () => {
    await switchRole('STUDENT');
    navigate('/dashboard');
  };

  const steps = [
    { title: 'UPLOAD', desc: 'Drop PDF, DOCX or slides. Automated AI page counting.', icon: FileText },
    { title: 'CUSTOMIZE', desc: 'Choose color/B&W, duplex eco-discount, and copies.', icon: Sparkles },
    { title: 'CHOOSE KIOSK', desc: 'Locate nearest campus printer with live queue depth.', icon: MapPin },
    { title: 'BOOK', desc: 'Select instant 10s walk-up or scheduled time slot.', icon: Clock },
    { title: 'PAY', desc: '1-click debit via campus wallet or Razorpay mock.', icon: CreditCard },
    { title: 'COLLECT', desc: 'Show unique 8-char tracking code for sealed envelope.', icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-dark flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-brand-cardBorder px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-deep to-brand-purple flex items-center justify-center text-white shadow-soft">
              <span className="font-extrabold text-xl">Q</span>
              <span className="text-[10px] text-brand-turquoise font-black -ml-0.5">0</span>
            </div>
            <div>
              <div className="font-extrabold text-xl text-brand-dark tracking-tight">
                Queue<span className="text-brand-purple">Zero</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-mutedText">
                Campus Print Platform
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-brand-mutedText">
            <a href="#how-it-works" className="hover:text-brand-purple transition-colors">How It Works</a>
            <a href="#features" className="hover:text-brand-purple transition-colors">Features</a>
            <a href="#security" className="hover:text-brand-purple transition-colors">Zero-Knowledge Security</a>
            <a href="#faq" className="hover:text-brand-purple transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-purple hover:bg-brand-lavender transition-all"
            >
              Sign In
            </button>
            <button
              onClick={handleLaunchApp}
              className="px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-deep text-white text-xs font-bold shadow-soft hover:shadow-glow flex items-center gap-1.5 transition-all"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-6 lg:px-12">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-brand-purple/10 to-brand-turquoise/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-lavender border border-purple-200 text-brand-purple text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-brand-purple" />
            <span>Autonomous Campus Print Fleet Management</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-dark tracking-tight leading-[1.15]">
            Print Smarter. <br />
            <span className="bg-gradient-to-r from-brand-purple via-indigo-600 to-brand-deep bg-clip-text text-transparent">
              Wait Less.
            </span>
          </h1>

          <p className="text-brand-mutedText text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Upload your documents, book a campus printing kiosk, pay securely and collect your prints without standing in queues.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handleLaunchApp}
              className="px-8 py-3.5 rounded-2xl bg-brand-purple hover:bg-brand-deep text-white font-bold text-sm shadow-soft hover:shadow-glow flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Printer className="w-4 h-4" />
              <span>Start Printing Now</span>
            </button>

            <button
              onClick={() => navigate('/kiosks')}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-brand-lavender text-brand-dark font-bold text-sm border border-brand-cardBorder shadow-sm flex items-center gap-2 transition-all"
            >
              <MapPin className="w-4 h-4 text-brand-purple" />
              <span>Explore Campus Kiosks</span>
            </button>
          </div>

          {/* Metric Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10">
            <div className="p-4 rounded-2xl bg-white border border-brand-cardBorder shadow-soft text-center">
              <div className="text-2xl font-black text-brand-purple">0.0s</div>
              <div className="text-[11px] font-bold text-gray-500 uppercase mt-0.5">Counter Wait Time</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-brand-cardBorder shadow-soft text-center">
              <div className="text-2xl font-black text-brand-turquoise">99.4%</div>
              <div className="text-[11px] font-bold text-gray-500 uppercase mt-0.5">SLA Dispatch Rate</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-brand-cardBorder shadow-soft text-center">
              <div className="text-2xl font-black text-brand-dark">&lt; 12s</div>
              <div className="text-[11px] font-bold text-gray-500 uppercase mt-0.5">Warmup To Delivery</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-brand-cardBorder shadow-soft text-center">
              <div className="text-2xl font-black text-green-600">100%</div>
              <div className="text-[11px] font-bold text-gray-500 uppercase mt-0.5">Cashless Telemetry</div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Steps Section */}
      <section id="how-it-works" className="py-16 px-6 lg:px-12 bg-white border-y border-brand-cardBorder">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-purple">End-to-End Workflow</span>
            <h2 className="text-3xl font-extrabold text-brand-dark mt-1">Zero Lines. Zero Delays.</h2>
            <p className="text-sm text-brand-mutedText mt-2">
              Follow the six seamless stages from upload to physical pickup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.title}
                  className="p-5 rounded-2xl bg-brand-bg border border-brand-cardBorder hover:border-brand-purple transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-brand-purple flex items-center justify-center font-bold">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-400">0{idx + 1}</span>
                    </div>
                    <div className="font-bold text-sm text-brand-dark group-hover:text-brand-purple transition-colors">
                      {st.title}
                    </div>
                    <p className="text-xs text-brand-mutedText mt-1.5 leading-snug">
                      {st.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security & Cryptographic Privacy Section */}
      <section id="security" className="py-16 px-6 lg:px-12 bg-gradient-to-b from-[#FAF8FF] to-white">
        <div className="max-w-5xl mx-auto rounded-3xl bg-brand-dark text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-brand-purple/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-700/60 text-brand-turquoise text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero-Knowledge Document Vault</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Cryptographic Shredding & Sealed Envelopes
            </h3>

            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Uploaded materials are encrypted with AES-256-GCM. Physical sheets are printed with removable tracking-code margins and immediately packaged into tamper-proof sealed envelopes. Cryptographic keys are destroyed upon tray exit.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-turquoise flex-shrink-0" />
                <span>Zero cloud engineer file-view access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-turquoise flex-shrink-0" />
                <span>8-Character token verification on collection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-turquoise flex-shrink-0" />
                <span>Optional student OTP verification challenge</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-turquoise flex-shrink-0" />
                <span>Auto-refund in case of paper jam or outage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-16 px-6 lg:px-12 bg-white border-t border-brand-cardBorder">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-purple">Support</span>
            <h2 className="text-3xl font-extrabold text-brand-dark mt-1">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3 pt-4 text-xs">
            <details className="p-4 rounded-2xl bg-brand-bg border border-brand-cardBorder group">
              <summary className="font-bold text-sm text-brand-dark cursor-pointer list-none flex items-center justify-between">
                <span>How does QueueZero eliminate the campus printing line?</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-brand-mutedText mt-2 leading-relaxed">
                By allowing students to configure, pay, and queue prints digitally. When you walk up to your selected kiosk, your document is already printed, sealed in an envelope, or instantly spooled upon QR scan with an under-10-second SLA.
              </p>
            </details>

            <details className="p-4 rounded-2xl bg-brand-bg border border-brand-cardBorder group">
              <summary className="font-bold text-sm text-brand-dark cursor-pointer list-none flex items-center justify-between">
                <span>What is the removable tracking-code margin?</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-brand-mutedText mt-2 leading-relaxed">
                Each sheet includes a perforated 0.5-inch strip at the bottom showing your 8-character token (e.g. 8XUI-Z123) and registration number. This allows the kiosk operator to verify your envelope without reading your content. You can tear it off cleanly!
              </p>
            </details>

            <details className="p-4 rounded-2xl bg-brand-bg border border-brand-cardBorder group">
              <summary className="font-bold text-sm text-brand-dark cursor-pointer list-none flex items-center justify-between">
                <span>Can I pay using my University Smart Card or Campus Wallet?</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-brand-mutedText mt-2 leading-relaxed">
                Yes! Every student receives a campus smart wallet with ₹250 promotional credits upon registration. You can also pay via simulated Razorpay sandbox, UPI, or debit cards.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-brand-dark text-white py-10 px-6 lg:px-12 border-t border-purple-900/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-purple flex items-center justify-center text-white font-extrabold text-sm">
              Q0
            </div>
            <div>
              <strong className="text-white">QueueZero (Q-Zero) Campus Fleet</strong>
              <div className="text-[10px]">Print Smarter. Wait Less.</div>
            </div>
          </div>

          <div>
            Built for AI Website Build Sprint Hackathon 2026. Fully functional full-stack system.
          </div>

          <div className="flex items-center gap-4 text-gray-300">
            <Link to="/login" className="hover:text-white">Student Portal</Link>
            <Link to="/admin" className="hover:text-white">Admin HUD</Link>
            <Link to="/operator" className="hover:text-white">Kiosk Operator</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
