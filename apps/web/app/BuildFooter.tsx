'use client';

export function BuildFooter({
  sha,
  builtAt,
  deploymentId,
}: {
  sha: string;
  builtAt: string;
  deploymentId: string;
}) {
  const time = builtAt && builtAt !== 'unknown'
    ? new Date(builtAt).toLocaleString(undefined, { timeZoneName: 'short' })
    : null;

  return (
    <div style={{ padding: 12, borderTop: '1px solid #eee', color: '#666', fontSize: 12 }}>
      Build: <code>{sha}</code>
      {time ? (
        <>
          {' '}• <span>{time}</span>
        </>
      ) : (
        <> • <span>time unknown</span></>
      )}
      {' '}• <span style={{ color: '#999' }}>dpl {String(deploymentId).slice(0, 10)}</span>
    </div>
  );
}
