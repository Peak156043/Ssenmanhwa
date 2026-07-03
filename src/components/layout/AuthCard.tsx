import Link from 'next/link';

export function AuthCard({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-200px)] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-lg border border-ink-700 bg-ink-800/60 p-6 shadow-card sm:p-8">
        <h1 className="font-display text-xl text-paper-100">{title}</h1>
        <p className="mt-1 text-sm text-paper-500">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      <p className="mt-4 text-center text-sm text-paper-500">
        {footerText}{' '}
        <Link href={footerLinkHref} className="text-violet-400 hover:underline">
          {footerLinkText}
        </Link>
      </p>
    </div>
  );
}
