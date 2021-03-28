import {deselectCurrent} from './utils'

type Format = 'text/plain' | 'text/html' | 'default'
type IE11Format = 'Text' | 'Url'

interface Options {
  onCopy?: (copiedText: DataTransfer | null) => unknown
  format?: Format
}

const clipboardToIE11Formatting: Record<Format, IE11Format> = {
  "text/plain": "Text",
  "text/html": "Url",
  "default": "Text"
}

const copy = (text: string, options: Options = {}) => {
  const {onCopy, format} = options

  let success = false

  const reselectPrevious = deselectCurrent()

  const range = document.createRange()
  const selection = document.getSelection()

  const mark = document.createElement('span')

  mark.textContent = text

  mark.addEventListener('copy', (e) => {
    e.stopPropagation();
    if (format) {
      e.preventDefault()
      if (!e.clipboardData) {
        // 只有 IE 11 里 e.clipboardData 一直为 undefined
        // 这里 format 要转为 IE 11 里指定的 format
        const IE11Format = clipboardToIE11Formatting[format || 'default']
        // @ts-ignore clearData 只有 IE 上有
        window.clipboardData.clearData()
        // @ts-ignore setData 只有 IE 上有
        window.clipboardData.setData(IE11Format, text);
      } else {
        e.clipboardData.clearData()
        e.clipboardData.setData(format, text)
      }
    }

    if (onCopy) {
      e.stopPropagation()
      e.preventDefault()
      onCopy(e.clipboardData)
    }
  })

  // 插入 body 中
  document.body.appendChild(mark)

  // 选中
  range.selectNodeContents(mark)
  selection.addRange(range)

  try {
    // execCommand 有些浏览器可能不支持，这里要 try 一下
    success = document.execCommand('copy')

    if (!success) {
      throw new Error("Can't not copy")
    }
  } catch (e) {
    try {
      // @ts-ignore window.clipboardData 这鬼玩意只有 IE 上有
      window.clipboardData.setData(format || 'text', text)
      // @ts-ignore window.clipboardData 这鬼玩意只有 IE 上有
      onCopy && onCopy(window.clipboardData)
    } catch (e) {
      // 最后兜底方案，让用户在 window.prompt 的时候输入
      window.prompt('输入需要复制的内容', text)
    }
  } finally {
    if (selection.removeRange) {
      selection.removeRange(range)
    } else {
      selection.removeAllRanges()
    }

    if (mark) {
      document.body.removeChild(mark)
    }
    reselectPrevious()
  }

  return success
}

export default copy
