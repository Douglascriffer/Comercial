import './globals.css'

export const metadata = {
  title: 'Dashboard Comercial — Criffer',
  description: 'Sistema de gestão comercial e vendas Criffer',
  icons: {
    icon: '/logo-base.png',
    shortcut: '/logo-base.png',
    apple: '/logo-base.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
