import copy from './lib/index'

const $copy = document.querySelector<HTMLButtonElement>('#copy')
const $myCopy = document.querySelector<HTMLButtonElement>('#my-copy')

$copy.onclick = () => {
  const copyText = document.querySelector<HTMLParagraphElement>('#text').innerText

  copy(copyText)
}

$myCopy.onclick = () => {
  const myText = document.querySelector<HTMLParagraphElement>('#my-text').innerText

  copy('xxx', {
    onCopy: (data) => data.setData('text/plain', myText),
  })
}
