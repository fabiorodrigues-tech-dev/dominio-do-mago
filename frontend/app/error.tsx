'use client';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
      <h2 className="text-2xl font-bold text-rose-500 mb-4">Ocorreu um erro arcano!</h2>
      <p className="text-sm mb-6 max-w-md">{error.message || 'Algo deu errado.'}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
}
