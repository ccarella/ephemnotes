import Link from 'next/link'

export default function MyPostPage() {
  return (
    <div className="min-h-screen p-4">
      <header className="max-w-4xl mx-auto py-6">
        <h1 className="text-3xl font-bold">My Post</h1>
        <p className="text-muted-foreground mt-2">View and manage your ephemeral thought</p>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="mt-8">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Your Current Post</h2>
            <p className="text-muted-foreground">You haven&apos;t created a post yet.</p>
            <Link
              href="/new-post"
              className="inline-block mt-4 px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
            >
              Create Your First Post
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
