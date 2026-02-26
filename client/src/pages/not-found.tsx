import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <h1 className="text-6xl font-bold text-gray-200 dark:text-gray-700">404</h1>
      <p className="text-gray-500 mt-2">Page not found</p>
      <Link href="/">
        <a className="mt-4 text-blue-500 hover:underline text-sm">← Back to dashboard</a>
      </Link>
    </div>
  );
}
