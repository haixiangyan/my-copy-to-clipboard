import copy from './lib/index'

const $copy = document.querySelector<HTMLButtonElement>('#copy')
const $myCopy = document.querySelector<HTMLButtonElement>('#my-copy')
const $text = document.querySelector<HTMLParagraphElement>('#text')

$copy.onclick = () => {
  const copyText = $text.textContent

  copy(copyText)
}

$myCopy.onclick = () => {
  const myText = document.querySelector<HTMLParagraphElement>('#my-text').innerText

  copy('xxx', {
    onCopy: (data) => data.setData('text/plain', myText),
  })
}
