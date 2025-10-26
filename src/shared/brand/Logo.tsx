type LogoProps = { 
  variant?: "full" | "mark"
  className?: string
  withBackground?: boolean
}

export function Logo({ variant = "full", className, withBackground = false }: LogoProps) {
  const logoSrc = variant === "full" ? "/full-logo.svg" : "/small-logo.svg"
  const altText = variant === "full" ? "SukaDex logo" : "SukaDex mark"
  
  const logoElement = (
    <img 
      src={logoSrc}
      alt={altText}
      className={className}
      aria-label={altText}
    />
  )

  if (withBackground) {
    const backgroundClass = variant === "mark" 
      ? "bg-[color:var(--logo-bg)] rounded-full p-3 shadow-lg"
      : "bg-[color:var(--logo-bg)] rounded-lg px-3 py-2"
      
    return (
      <div className={backgroundClass}>
        {logoElement}
      </div>
    )
  }
  
  return logoElement
}