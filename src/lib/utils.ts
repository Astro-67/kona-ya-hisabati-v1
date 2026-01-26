import {  clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type {ClassValue} from 'clsx';

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

// Localize helper - accepts a string or an object like { en: string, sw: string }
export function localize(value: any, lang: 'en' | 'sw' = 'en') {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    // Prefer explicit locale key
    if (typeof value[lang] === 'string') return value[lang]
    // Common keys used by backend
    if (typeof value.en === 'string') return value.en
    if (typeof value.sw === 'string') return value.sw
    // Fallback: first string-like value
    for (const k of Object.keys(value)) {
      if (typeof value[k] === 'string') return value[k]
    }
  }
  return String(value)
}
