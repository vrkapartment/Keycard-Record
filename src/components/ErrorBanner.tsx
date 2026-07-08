export function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-md border border-inactive-border bg-inactive-bg px-4 py-2 text-sm text-inactive-text">
      {message}
    </div>
  );
}
