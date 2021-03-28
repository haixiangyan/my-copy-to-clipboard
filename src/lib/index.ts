import {deselectCurrent} from './utils'

interface Options {
  onCopy?: (copiedText: DataTransfer | null) => unknown
}

const copy = (text: string, options: Options = {}) => {
  const {onCopy} = options

  const reselectPrevious = deselectCurrent()

  const range = document.createRange()
  const selection = document.getSelection()

  const mark = document.createElement('span')
  mark.textContent = text

  mark.addEventListener('copy', (e) => {
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

  const success = document.execCommand('copy')

  if (mark) {
    document.body.removeChild(mark)
  }

  // 移除所有 ranges
  selection.removeAllRanges()

  reselectPrevious()

  return success
}

export default copy
