// File: src/components/admin/layout/AdminSidebar.tsx
'use client'

import { Fragment } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Dialog, Transition } from '@headlessui/react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Youtube,
  Building2,
  Search,
  Upload,
  Users,
  Settings,
  X
} from 'lucide-react'

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'EDITOR', 'SEO'] },
  { name: 'Artikel', href: '/admin/articles', icon: FileText, roles: ['ADMIN', 'EDITOR'] },
  { name: 'Project', href: '/admin/projects', icon: FolderOpen, roles: ['ADMIN', 'EDITOR'] },
  { name: 'YouTube', href: '/admin/youtube', icon: Youtube, roles: ['ADMIN', 'EDITOR'] },
  { name: 'Company Profile', href: '/admin/company', icon: Building2, roles: ['ADMIN'] },
  { name: 'SEO', href: '/admin/seo', icon: Search, roles: ['ADMIN', 'SEO'] },
  { name: 'Media', href: '/admin/media', icon: Upload, roles: ['ADMIN', 'EDITOR'] },
  { name: 'Users', href: '/admin/users', icon: Users, roles: ['ADMIN'] },
]

export function AdminSidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname()
  const { user, hasRole } = useAuth()

  const filteredNavigation = navigation.filter(item => 
    item.roles.some(role => hasRole(role as any))
  )

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">TF</span>
          </div>
          <span className="ml-3 text-xl font-bold text-gray-900">
            The Formulator
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-6 pb-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-gray-700 hover:text-emerald-700 hover:bg-emerald-50',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors'
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <item.icon
                        className={cn(
                          isActive ? 'text-emerald-700' : 'text-gray-400 group-hover:text-emerald-700',
                          'h-6 w-6 shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>

          {/* User info */}
          <li className="mt-auto">
            <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900">
              <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <span className="sr-only">Your profile</span>
              <div className="flex flex-col">
                <span>{user?.name}</span>
                <span className="text-xs text-gray-500">{(user as any)?.role}</span>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <X className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <SidebarContent />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white">
          <SidebarContent />
        </div>
      </div>
    </>
  )
}