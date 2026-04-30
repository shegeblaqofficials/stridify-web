import { StridifyLogo } from "@/components/embed/primitives/logo";
import type { AppConfig, EmbedErrorDetails } from "@/lib/embed/types";
import { cn } from "@/lib/embed/utils";

interface ErrorMessageProps {
  appConfig: AppConfig;
  error: EmbedErrorDetails | null;
}

export function ErrorMessage({ appConfig, error }: ErrorMessageProps) {
  const logo = appConfig.logo;
  const logoDark = appConfig.logoDark;
  const companyName = appConfig.companyName || "Stridify";

  return (
    <div
      inert={error === null}
      className={cn(
        "absolute inset-0 z-50 flex h-full w-full flex-col items-center justify-center gap-5 transition-opacity",
        error === null ? "opacity-0" : "opacity-100",
      )}
    >
      <div className="pl-3">
        {logo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo}
              alt={`${companyName} Logo`}
              className="block size-6 dark:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoDark || logo}
              alt={`${companyName} Logo`}
              className="hidden size-6 dark:block"
            />
          </>
        ) : (
          <StridifyLogo className="text-foreground size-6" />
        )}
      </div>

      <div className="flex w-full flex-col justify-center gap-4 overflow-auto px-8 text-center">
        <span className="leading-tight font-medium text-pretty">
          {error?.title}
        </span>
        <span className="text-sm text-balance">{error?.description}</span>
      </div>
    </div>
  );
}
