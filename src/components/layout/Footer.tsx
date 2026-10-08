export function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>
            Federal University of Technology, Minna &middot; Niger State
          </p>
          <p>Digital Library &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  )
}
