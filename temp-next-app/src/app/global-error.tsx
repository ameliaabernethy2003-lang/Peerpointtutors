'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ padding: '40px', fontFamily: 'monospace' }}>
          <h2>Something went wrong!</h2>
          <p style={{ color: 'red' }}><strong>Error:</strong> {error.message}</p>
          <pre style={{ background: '#f0f0f0', padding: '16px', overflow: 'auto', fontSize: '12px' }}>
            {error.stack}
          </pre>
          <button
            onClick={() => reset()}
            style={{ marginTop: '16px', padding: '8px 16px', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
