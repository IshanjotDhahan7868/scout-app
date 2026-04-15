'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Building2, ShoppingBag, ClipboardList, MessageSquare } from 'lucide-react'

const links = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/property', icon: Building2, label: 'Property' },
  { href: '/deals', icon: ShoppingBag, label: 'Deals' },
  { href: '/orders', icon: ClipboardList, label: 'Tasks' },
  { href: '/chat', icon: MessageSquare, label: 'Chat' },
]

export default function Nav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50">
      <div className="max-w-lg mx-auto flex justify-around py-2">
        {links.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== '/' && path.startsWith(href))
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${active ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <Icon size={22} />
              <span className="text-[10px]">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
