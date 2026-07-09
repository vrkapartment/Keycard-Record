export function SuccessBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mb-4 rounded-md border border-active-text/20 bg-active-bg px-4 py-2 text-sm text-active-text">
      {message}
    </div>
  );
}
