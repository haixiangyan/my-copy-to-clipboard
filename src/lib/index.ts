const copy = (text: string) => {
  const range = document.createRange()
  const selection = document.getSelection()

  const mark = document.createElement('span')
  mark.textContent = text

  // 插入 body 中
  document.body.appendChild(mark)

  // 选中
  range.selectNodeContents(mark)
  selection.removeAllRanges()
  selection.addRange(range)

  const success = document.execCommand('copy')

  if (success) {
    console.log('复制成功')
  } else {
    console.log('复制失败')
  }

  if (mark) {
    document.body.removeChild(mark)
  }
}

export default copy
