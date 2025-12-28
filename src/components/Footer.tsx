export function Footer() {
  return (
    <footer className="border-t mt-12">
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Product Analytics Dashboard. Built with
          Next.js 15, TypeScript, and Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}
