export const deselectCurrent = () => {
  const selection = document.getSelection()

  // 当前没有选中
  if (selection.rangeCount === 0) {
    return () => {}
  }

  let $active = document.activeElement

  // 获取当前选中的 ranges
  const ranges: Range[] = []
  for (let i = 0; i < selection.rangeCount; i++) {
    ranges.push(selection.getRangeAt(i))
  }

  // 如果为输入元素先 blur 再 focus
  switch ($active.tagName.toUpperCase()) {
    case 'INPUT':
    case 'TEXTAREA':
      ($active as HTMLInputElement | HTMLTextAreaElement).blur()
      break
    default:
      $active = null
  }

  // deselect
  selection.removeAllRanges();

  return () => {
    console.log($active)
    // 如果是插入符则移除 ranges
    if (selection.type === 'Caret') {
      selection.removeAllRanges()
    }

    // 没有选中，就把之前的 ranges 加回来
    if (selection.rangeCount === 0) {
      ranges.forEach(range => {
        selection.addRange(range)
      })
    }

    if ($active) {
      ($active as HTMLInputElement | HTMLTextAreaElement).focus()
    }
  }
}
