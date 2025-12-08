import { StarknetProvider } from "../context/StarknetProvider";
import Navbar from "../components/NavBar";
import FooterInfo from "../components/FooterInfo";
function layout({ children }) {
  return (
    <StarknetProvider>
      <div className="min-h-[100dvh] flex flex-col overflow-auto">
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
        <footer className="fixed bottom-0 left-0 right-0">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-2">
            <FooterInfo />
          </div>
        </footer>
      </div>
    </StarknetProvider>
  );
}

export default layout;
