import { UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

import { useRouter } from "~/i18n/i18nConfig";
import { useSupabase } from "~/lib/supabase/SupabaseProvider";
import { cn } from "~/lib/utils";
import { Icon } from "~/ui/components/Icon";
import { Avatar, AvatarFallback, AvatarImage } from "~/ui/primitives/avatar";
import { Button } from "~/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/ui/primitives/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/ui/primitives/dropdown-menu";

import { CurrentUserAvatar } from "../current-user-avatar";

interface HeaderUserDropdownProps {
  isDashboard: boolean;
  userEmail: string;
  userImage?: null | string;
  userName: string;
}

export function HeaderUserDropdown({
  isDashboard = false,
  userEmail,
  userImage,
  userName,
}: HeaderUserDropdownProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const t = useTranslations();
  const route = useRouter();
  const { signOut } = useSupabase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="relative overflow-hidden rounded-full"
          size="icon"
          variant="ghost"
        >
          <CurrentUserAvatar />
          {/* <Avatar className="h-9 w-9">
            <AvatarImage
              alt={userName || "User"}
              src={userImage || undefined}
            />
            <AvatarFallback>
              {userName ? (
                userName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
              ) : (
                <UserIcon className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar> */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <Avatar className="h-8 w-8 bg-primary/10">
            <AvatarImage
              alt={userName || "User"}
              src={userImage || undefined}
            />
            <AvatarFallback>
              {userName ? (
                userName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
              ) : (
                <UserIcon className="h-4 w-4 text-primary" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-medium">{userName || "User"}</p>
            <p
              className={"max-w-[160px] truncate text-xs text-muted-foreground"}
            >
              {userEmail}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link className="cursor-pointer" href="/profile">
            <Icon
              className="mr-2 h-4 w-4 text-primary"
              icon="heroicons-duotone:user-circle"
            />
            {t("User.profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={cn(
            "cursor-pointer",
            isDashboard
              ? "text-red-600"
              : `
                txt-destructive
                focus:text-destrctive
              `
          )}
          onClick={() => setShowLogoutConfirm(true)}
        >
          <Icon
            className="mr-2 h-4 w-4 text-red-500"
            icon="heroicons-duotone:arrow-right-on-rectangle"
          />
          {t("User.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* 退出登录确认对话框 */}
      <Dialog onOpenChange={setShowLogoutConfirm} open={showLogoutConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Auth.logoutConfirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("Auth.logoutConfirmDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowLogoutConfirm(false)}
              variant="outline"
            >
              {t("Common.cancel")}
            </Button>
            <Button
              onClick={async () => {
                // window.location.href = "/auth/sign-out";
                await signOut();
                window.location.href = "/auth/sign-in";
              }}
              variant="destructive"
            >
              <Icon
                className="mr-2 h-4 w-4"
                icon="heroicons-duotone:arrow-right-on-rectangle"
              />
              {t("Auth.confirmLogout")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
}
