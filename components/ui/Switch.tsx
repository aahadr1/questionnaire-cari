'use client'

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'

interface SwitchProps {
  label?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
}

export function Switch({ label, checked = false, onChange, disabled }: SwitchProps) {
  const [isChecked, setIsChecked] = useState(checked)

  // Sync with external checked prop
  useEffect(() => {
    setIsChecked(checked)
  }, [checked])

  const handleToggle = () => {
    if (!disabled) {
      const newValue = !isChecked
      setIsChecked(newValue)
      onChange?.(newValue)
    }
  }

  return (
    <label className="flex items-center cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={handleToggle}
        className={clsx(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500',
          isChecked ? 'bg-black' : 'bg-gray-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={clsx(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            isChecked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
      {label && <span className="ml-3 text-sm font-medium text-gray-700">{label}</span>}
    </label>
  )
}
