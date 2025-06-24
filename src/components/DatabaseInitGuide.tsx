export function DatabaseInitGuide() {
  return (
    <div className="p-8 border border-amber-200 dark:border-amber-900/50 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-center animate-fade-in">
      <svg
        className="w-12 h-12 mx-auto text-amber-600 dark:text-amber-400 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p className="text-amber-900 dark:text-amber-300 text-lg font-medium mb-2">
        Database Not Initialized
      </p>
      <p className="text-amber-800 dark:text-amber-400 text-sm leading-relaxed mb-6 max-w-md mx-auto">
        The posts table hasn&apos;t been created yet. Run the following command to initialize your database:
      </p>
      <code className="inline-block px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 rounded-lg font-mono text-sm">
        npx supabase db push
      </code>
      <p className="text-amber-700 dark:text-amber-500 text-xs mt-4">
        Make sure your Supabase project is properly configured in your environment variables.
      </p>
    </div>
  )
}