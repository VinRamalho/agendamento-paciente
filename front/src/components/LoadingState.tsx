type LoadingStateProps = {
  message?: string;
};

export function LoadingState({
  message = 'Carregando...',
}: LoadingStateProps) {
  return (
    <div
      className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <span className="mr-3 inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
      {message}
    </div>
  );
}
