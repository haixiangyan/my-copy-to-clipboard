import copy from './lib/index'

const $copy = document.querySelector<HTMLButtonElement>('#copy')
const $text = document.querySelector<HTMLParagraphElement>('#text')

$copy.onclick = () => {
  const copyText = $text.textContent

  copy(copyText)
}
