export type Format = 'text/plain' | 'text/html' | 'default'
export type IE11Format = 'Text' | 'Url'

export interface Options {
  onCopy?: (copiedText: DataTransfer | null) => unknown
  format?: Format
}

export const clipboardToIE11Formatting: Record<Format, IE11Format> = {
  "text/plain": "Text",
  "text/html": "Url",
  "default": "Text"
}

