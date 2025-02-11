import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-4 border-t">
      <div className="container flex justify-between items-center">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Control de Fichaje. Un proyecto de <a href="https://ruralhackers.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">Rural Hackers</a>
        </p>
        <a
          href="https://github.com/ruralhackers/worklog-single-company"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Github className="w-4 h-4" />
          <span>Código fuente</span>
        </a>
      </div>
    </footer>
  );
} 