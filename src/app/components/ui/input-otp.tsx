import * as React from "react"
import { Dot } from "lucide-react"

import { cn } from "@/lib/utils"

type OTPInputContextValue = {
  slots: Array<{ char: string; hasFakeCaret: boolean; isActive: boolean }>
}

const OTPInputContext = React.createContext<OTPInputContextValue>({ slots: [] })

type OTPInputProps = React.ComponentPropsWithoutRef<"div"> & {
  value?: string
  onChange?: (value: string) => void
  length?: number
  containerClassName?: string
}

const OTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
  ({ className, containerClassName, value, onChange, length = 6, children, ...props }, ref) => {
    const safeValue = (value ?? "").slice(0, length)
    const slots = Array.from({ length }).map((_, i) => ({
      char: safeValue[i] ?? "",
      hasFakeCaret: i === safeValue.length,
      isActive: i === safeValue.length,
    }))

    return (
      <div className={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)}>
        <OTPInputContext.Provider value={{ slots }}>
          <div ref={ref} className={cn("disabled:cursor-not-allowed", className)} {...props}>
            {children}
          </div>
        </OTPInputContext.Provider>
      </div>
    )
  }
)

const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(
  ({ className, containerClassName, ...props }, ref) => (
    <OTPInput ref={ref} className={className} containerClassName={containerClassName} {...props} />
  )
)
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center", className)} {...props} />
)
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index] || { char: "", hasFakeCaret: false, isActive: false }

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-2 ring-ring ring-offset-background",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink h-4 w-px bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ ...props }, ref) => (
    <div ref={ref} role="separator" {...props}>
      <Dot />
    </div>
  )
)
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
