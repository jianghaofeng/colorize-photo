"use client";

import { Avatar, AvatarFallback, AvatarImage } from "~/ui/primitives/avatar";

export function ProfileHeader() {
  return (
    <div
      className={`
        mb-8 flex flex-col items-center gap-6
        md:flex-row md:items-start md:gap-8
      `}
    >
      <Avatar
        className={`size-24 border-4 border-primary/10 ring-2 ring-primary/20`}
      >
        <AvatarImage
          alt="Jenny Klabber"
          src="/images/profile/jenny-klabber.jpg"
        />
        <AvatarFallback className="text-xl">JK</AvatarFallback>
      </Avatar>

      <div
        className={`
          flex flex-1 flex-col items-center text-center
          md:items-start md:text-left
        `}
      >
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Jenny Klabber</h1>
          <span className="inline-flex items-center">
            <svg
              aria-hidden="true"
              className="size-5 text-blue-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <title>已验证</title>
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </span>
        </div>

        <div
          className={`
            mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm
            text-muted-foreground
          `}
        >
          <div className="flex items-center gap-1.5">
            <svg
              aria-hidden="true"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <title>位置图标</title>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>SF, Bay Area</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg
              aria-hidden="true"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <title>邮箱图标</title>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <path d="M22 6l-10 7L2 6" />
            </svg>
            <span>jenny@kteam.com</span>
          </div>

          <div className="flex items-center gap-1.5">
            <svg
              aria-hidden="true"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <title>公司图标</title>
              <path d="M20 7h-3a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
              <path d="M16 3v4" />
              <path d="M8 3v4" />
              <path d="M4 11h6" />
              <path d="M4 15h6" />
              <path d="M4 19h6" />
              <path d="M4 7h16" />
            </svg>
            <span>KeenThemes</span>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            className={`
              rounded-md bg-primary px-4 py-2 text-sm font-medium
              text-primary-foreground
            `}
            type="button"
          >
            连接
          </button>
          <button
            className={`
              rounded-md border border-input bg-background px-4 py-2 text-sm
              font-medium
            `}
            type="button"
          >
            消息
          </button>
          <button
            className={`
              rounded-md border border-input bg-background p-2 text-sm
            `}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <title>更多选项</title>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
