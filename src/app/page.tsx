export default function Home() {
  return (
    <div className="min-h-screen p-4">
      <header className="max-w-4xl mx-auto py-6">
        <h1 className="text-3xl font-bold">EphemNotes</h1>
        <p className="text-muted-foreground mt-2">Share your ephemeral thoughts</p>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <p className="text-muted-foreground">
                No posts yet. Sign in to create your first post!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
