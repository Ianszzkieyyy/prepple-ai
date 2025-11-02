"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Shapes,
  History,
  DiamondPlus,
  Users
} from "lucide-react"

import logoIcon from "@/public/logo-icon.svg"
import Image from "next/image"

import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {name: string, email: string} | null;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon"  {...props}>
      <SidebarHeader >
        {open ? (
          <div className="flex gap-4 p-2 items-center">
            <div className="bg-foreground flex justify-center items-center rounded-md w-8 h-8">
              <Image src={logoIcon} alt="PreppleAI Logo" width={16} height={16} />
            </div>
            <div className="flex flex-col">
              <h1>PreppleAI</h1>
              <p className="text-xs">Admin Dashboard</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-2">
            <div className="bg-foreground flex justify-center items-center rounded-sm w-6 h-6">
              <Image src={logoIcon} alt="PreppleAI Logo" width={12} height={12} />
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem key={"Dashboard"}>
            <SidebarMenuButton asChild>
              <Link href={"/admin"}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarGroup className="-p-2">
            <SidebarGroupLabel>Rooms</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenuItem key={"Create Rooms"}>
                <SidebarMenuButton asChild>
                  <Link href={"/admin/create"}>
                    <DiamondPlus className="mr-2 h-4 w-4" />
                    <span>Create Rooms</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem key={"View Rooms"}>
                <SidebarMenuButton asChild>
                  <Link href={"/admin/rooms"}>
                    <Shapes className="mr-2 h-4 w-4" />
                    <span>View Rooms</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="-p-2">
            <SidebarGroupLabel>Clients</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenuItem key={"Clients List"}>
                <SidebarMenuButton asChild>
                  <Link href={"/admin/list"}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Clients List</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem key={"Records"}>
                <SidebarMenuButton asChild>
                  <Link href={"/admin/records"}>
                    <History className="mr-2 h-4 w-4" />
                    <span>Records</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarGroupContent>
          </SidebarGroup>

        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
