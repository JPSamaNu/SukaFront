import * as React from "react"

export interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export interface TabsListProps {
  children: React.ReactNode
  className?: string
}

export interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

export interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
}>({
  value: '',
  onValueChange: () => {},
})

export function Tabs({ defaultValue = '', value: controlledValue, onValueChange, children, className = '' }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const value = controlledValue !== undefined ? controlledValue : internalValue
  const handleValueChange = onValueChange || setInternalValue

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-lg bg-[color:var(--surface-2)] p-1 text-[color:var(--muted)] ${className}`}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className = '' }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext)
  const isActive = selectedValue === value

  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? 'bg-[color:var(--surface)] text-[color:var(--text)] shadow-sm'
          : 'text-[color:var(--muted)] hover:bg-[color:var(--surface)]/50'
      } ${className}`}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const { value: selectedValue } = React.useContext(TabsContext)

  if (selectedValue !== value) {
    return null
  }

  return (
    <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}>
      {children}
    </div>
  )
}
