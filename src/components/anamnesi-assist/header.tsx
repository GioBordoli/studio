import { Stethoscope } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-3 flex items-center">
        <Stethoscope className="h-8 w-8 text-primary" />
        <h1 className="ml-3 text-2xl font-bold text-primary">
          AnamnesiAssist
        </h1>
      </div>
    </header>
  );
}
