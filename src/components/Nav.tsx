'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, ClipboardList, MessageSquare, ShieldCheck } from 'lucide-react'

const links = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/property/ops', icon: ShieldCheck, label: 'Property' },
  { href: '/deals', icon: ShoppingBag, label: 'Deals' },
  { href: '/orders', icon: ClipboardList, label: 'Tasks' },
  { href: '/chat', icon: MessageSquare, label: 'Ask AI' },
]

export default function Nav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{ background: '#1C1410', borderTop: '1px solid #3A2D20' }}>
      <div className="max-w-lg mx-auto flex justify-around py-2 px-2">
        {links.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== '/' && path.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
              style={{
                color: active ? '#C4A265' : '#8A7968',
                background: active ? 'rgba(196,162,101,0.08)' : 'transparent',
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
