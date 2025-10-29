"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
	LayoutDashboard,
	Settings,
	UserRound,
	Users2,
	FolderKanban,
} from "lucide-react"

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
	SidebarHeader,
} from "@/components/ui/sidebar"

type NavItem = {
	title: string
	href: string
	icon: LucideIcon
}

const mainNav: NavItem[] = [
	{ title: "Dashboard", href: "/admin", icon: LayoutDashboard },
	{ title: "Rooms", href: "/admin/rooms", icon: FolderKanban },
	{ title: "Users", href: "/admin/users", icon: Users2 },
]

const secondaryNav: NavItem[] = [
	{ title: "Settings", href: "/admin/settings", icon: Settings },
	{ title: "Profile", href: "/admin/profile", icon: UserRound },
]


function isActivePath(pathname: string, href: string) {
	if (pathname === href) return true
	return pathname.startsWith(`${href}/`)
}

export default function AdminSidebar() {
	const pathname = usePathname()

	return (
		<Sidebar>
			<SidebarHeader className="px-2 py-3">
				<div className="flex h-12 items-center gap-2 rounded-md bg-sidebar-accent/20 px-2 text-sm font-semibold">
					<span>PreppleAI</span>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Overview</SidebarGroupLabel>
					<SidebarMenu>
						{mainNav.map((item) => (
							<SidebarMenuItem key={item.href}>
								<SidebarMenuButton
									asChild
									tooltip={item.title}
									isActive={isActivePath(pathname, item.href)}
								>
									<Link href={item.href}>
										<item.icon className="size-4" />
										<span>{item.title}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarSeparator className="my-0" />
			<SidebarFooter>
				<SidebarMenu>
					{secondaryNav.map((item) => (
						<SidebarMenuItem key={item.href}>
							<SidebarMenuButton
								asChild
								tooltip={item.title}
								isActive={isActivePath(pathname, item.href)}
							>
								<Link href={item.href}>
									<item.icon className="size-4" />
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	)
}

