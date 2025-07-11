import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = ({ children, ...props }) => (
  <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>
);

const TooltipTrigger = React.forwardRef(({ ...props }, ref) => (
  <TooltipPrimitive.Trigger ref={ref} {...props} />
));
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

const TooltipContent = React.forwardRef(({ className = "", sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={`z-50 overflow-hidden rounded-md bg-black px-3 py-1.5 text-sm text-white shadow-md ${className}`}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
