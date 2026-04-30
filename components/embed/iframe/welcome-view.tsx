import { Button } from "@/components/embed/primitives/button";
import { StridifyLogo } from "@/components/embed/primitives/logo";
import type { AppConfig } from "@/lib/embed/types";

type WelcomeViewProps = {
  appConfig: AppConfig;
  disabled: boolean;
  onStartCall: () => void;
};

export const WelcomeView = ({
  appConfig,
  disabled,
  onStartCall,
  ref,
}: React.ComponentProps<"div"> & WelcomeViewProps) => {
  const { logo, logoDark, companyName = "Stridify" } = appConfig;

  return (
    <div ref={ref} inert={disabled} className="absolute inset-0">
      <div className="flex h-full items-center justify-between gap-4 px-3">
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

        <Button
          variant="primary"
          size="lg"
          onClick={onStartCall}
          className="w-48 font-mono"
        >
          {appConfig.startButtonText || "Chat with Agent"}
        </Button>
      </div>
    </div>
  );
};
