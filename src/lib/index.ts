const copy = (text: string) => {
  const range = document.createRange()
  const selection = document.getSelection()

  const mark = document.createElement('span')
  mark.textContent = text

  // 插入 body 中
  document.body.appendChild(mark)

  // 选中
  range.selectNodeContents(mark)
  selection.addRange(range)

  const success = document.execCommand('copy')

  if (success) {
    alert('复制成功')
  } else {
    alert('复制失败')
  }

  if (mark) {
    document.body.removeChild(mark)
  }
}

export default copy
