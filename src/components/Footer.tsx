export default function Footer() {
  return (
    <footer id="footer" className="border-t border-[#E2E8F2] bg-[#FFFFFF] py-12">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-sm text-[#5B6570]">
            © {new Date().getFullYear()} CloneSite. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-[#5B6570] hover:text-[#3355FF]">Privacy</a>
            <a href="#" className="text-sm text-[#5B6570] hover:text-[#3355FF]">Terms</a>
            <a href="#" className="text-sm text-[#5B6570] hover:text-[#3355FF]">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
