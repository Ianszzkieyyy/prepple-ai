export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    return (
          <main>
              {children}
          </main>
    )
}
