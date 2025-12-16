import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  { name: 'Faturas', path: '/faturas', icon: '💵' },
  { name: 'Despesas', path: '/despesas', icon: '💸' },
  { name: 'Clientes', path: '/clientes', icon: '👥' },
  { name: 'Aniversariantes', path: '/aniversariantes', icon: '🎂' },
  { name: 'Propostas', path: '/propostas', icon: '📋' },
  { name: 'Relatórios', path: '/relatorios', icon: '📈' },
]

export default function Sidebar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* Botão Hamburger Mobile */}
      <button
        onClick={toggleMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary-600 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-colors"
        aria-label="Menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Overlay escuro para mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex flex-col items-center justify-center">
          <div className="w-full mb-2">
            <img
              src="/logo-tecrastr-new.png"
              alt="Tec Rastreadores Logo"
              className="w-full h-auto object-contain"
            />
          </div>
          <h1 className="text-lg font-bold text-primary-600 text-center">Sistema de Gestão</h1>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={closeMenu}
              className={`flex items-center px-6 py-4 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors ${
                router.pathname === item.path ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600' : ''
              }`}
            >
              <span className="mr-3 text-2xl">{item.icon}</span>
              <span className="font-medium text-base">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
