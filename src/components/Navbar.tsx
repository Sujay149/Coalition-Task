import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Users, Calendar, MessageSquare, CreditCard, LayoutDashboard, Settings, MoreVertical } from "lucide-react";

/*
 * The API only exposes patients, so the signed-in practitioner in the navbar is
 * static chrome and is hardcoded on purpose. Patient data never comes from here.
 */
const DOCTOR = {
  name: "Dr. Jose Simmons",
  role: "General Practitioner",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jose",
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Patients", icon: Users },
    { name: "Schedule", icon: Calendar },
    { name: "Message", icon: MessageSquare },
    { name: "Transactions", icon: CreditCard },
  ];

  return (
    <header className="sticky top-4 z-50 mx-4">
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between rounded-full bg-white px-6 py-3 shadow-lg">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <img src="/logo.webp" alt="Tech.Care" className="h-8 w-8 object-contain" />
          Tech.Care
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex md:items-center md:gap-2">
          {links.map((link) => (
            <a
              key={link.name}
              href="#"
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                link.name === "Patients" 
                  ? "bg-[#01F0D0] text-[#072635]" 
                  : "text-[#707070] hover:text-[#072635]"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.name}
            </a>
          ))}
        </div>

        {/* Profile — hardcoded practitioner chrome (the API has no user endpoint) */}
        <div className="flex items-center gap-3 border-l border-[#E2E8F2] pl-4">
          <img
            src={DOCTOR.avatar}
            alt={DOCTOR.name}
            className="h-10 w-10 rounded-full"
          />
          <div className="hidden text-sm md:block">
            <p className="font-bold text-[#072635]">{DOCTOR.name}</p>
            <p className="text-[#707070]">{DOCTOR.role}</p>
          </div>
          <div className="hidden items-center gap-2 text-[#707070] md:flex">
            <Settings className="h-5 w-5 cursor-pointer hover:text-[#072635]" />
            <MoreVertical className="h-5 w-5 cursor-pointer hover:text-[#072635]" />
          </div>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute left-4 right-0 top-full mt-2 rounded-2xl bg-white p-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <a
                key={link.name}
                href="#"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-colors ${
                  link.name === "Patients" 
                    ? "bg-[#01F0D0] text-[#072635]" 
                    : "text-[#707070] hover:bg-[#F6F8FC] hover:text-[#072635]"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
