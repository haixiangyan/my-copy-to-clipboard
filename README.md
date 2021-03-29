# 造一个 copy-to-clipboard 轮子

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2071eedc881f466fa60196d8c0b3c969~tplv-k3u1fbpfcp-zoom-1.image)

> 项目代码：https://github.com/Haixiang6123/my-copy-to-clipboard
> 预览地址：[http://yanhaixiang.com/my-copy-to-clipboard/](http://yanhaixiang.com/my-copy-to-clipboard/)
> 参考轮子：https://www.npmjs.com/package/copy-to-clipboard

用 JS 来复制文本在网页应用里十分常见，比如 github 里复制 remote 地址的功能：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4bfee394f2384e2ba541d9715f1c39ac~tplv-k3u1fbpfcp-zoom-1.image)

今天就来带大家一起写一个 JS 复制文本的轮子吧~

## 从零开始

关于 JS 做复制功能的文章还挺多的，这里列举一篇 [阮一峰的《剪贴板操作 Clipboard API 教程》](https://www.ruanyifeng.com/blog/2021/01/clipboard-api.html) 作为例子。

大部分文章的做法是这样：创建一个输入框（input 或者 textarea），将复制文本赋值到元素的 value 值，JS 选中文本内容，最后使用 `document.exec('copy')` 完成复制。

这里的问题是，在某些环境下文本输入框会存在一些怪异的行为，比如：

* 如果不是文本输入标签，需要主动创建一个可输入文本的标签（input和textarea）然后将待复制的文本赋值给这个标签，再调用.select()方法选中这个标签才能继续执行 `document.execCommand('copy')` 去复制。
* 如果是文本输入标签，标签不可以赋予 disable 或者 readonly，这会影响 `select()` 方法。
* 移动端 iOS 在选中输入框的时候会有自动调整页面缩放的问题，如果没有对这个进行处理，调用 `select()` 方法时（其实就是让标签处于focus状态）会出现同样的问题。

听起来就很麻烦。为了去掉这些兼容问题，可以使用 `<span>` 元素作为复制文本的容器，那先按上面的思路，造一个最简单的轮子吧。

```ts
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
```

这里用到 Selection 和 Range 两个对象。关于 Selection 表示用户选择的文本范围或插入符号的当前位置。它代表页面中的文本选区，可能横跨多个元素；而 Range 表示一个包含节点与文本节点的一部分的文档片段。一个 Selection 可以有多个 Range 对象。

上面逻辑很简单，创建 `span` 元素，从 `textContent` 加入复制文本。这里有人就问了：为啥不用 `innerText` 呢？他们有什么区别呢？区别详见 [Stackoverflow: Difference between textContent vs innerText](https://stackoverflow.com/questions/35213147/difference-between-textcontent-vs-innertext)。

好的我知道你不会看的，这里就简单列一下吧：

1. 首先 `innerText` 是非标准的，`textContent` 是标准的
2. `innerText` 非常容易受 CSS 的影响，`textContent` 则不会：`innerText` 只返回可见的文本，而 `textContent` 返回全文本。比如 "Hello Wold" 文本，用 display: none 把 "Hello" 变成看不见了，那么 `innerText` 会返回 "World"，而 `textContent` 返回 "Hello World"。
3. `innerText` 性能差一点，因为需要等到渲染完了之后通过页面布局信息来获取文本
4. `innerText` 通过 HTMLElement 拿到，而 `textContent` 可以通过所有 Node 拿到，获取范围更广一些

回到代码，把创建好的 span 放入 document.body 里，并选中元素，把 range 加入 selection 中，`document.exec` 执行复制操作，最后一步把 mark 元素移除，收工了。

## 复制时好时坏

如果你弄了个按钮并绑定 `copy('Hello')`，点击后会发现：咦？怎么时好时坏的？一会可以复制一会又不行了。

刚刚提到 Selection 有可能是插入符号的当前位置，啥意思？**想一想鼠标点一下算不算选区呢？算的，只是长度为 0 你看不见而已。**

> 这时它被标记为 Collapsed，这表示选区被压缩至一点，即光标位置。—— [Selection](https://developer.mozilla.org/zh-CN/docs/Web/API/Selection)

长度为 0 好像也没什么问题嘛，刚刚代码不是 `addRange` 了么？**然而 `addRange` 并不会添加新 Range 到 Selection 中！**

> Currently only Firefox supports multiple selection ranges, other browsers will not add new ranges to the selection if it already contains one. —— [Selection.addRange()](https://developer.mozilla.org/en-US/docs/Web/API/Selection/addRange)

总结一下复制不成功的问题：
1. 当鼠标无意地点击到页面时（比如按钮），Selection 会加入一个看不见的 Range（变成光标的位置，而不是一个选中的区域了）
2. 在我们代码中 `selection.addRange` 后并不会把 span 里的选中文本作为新的 Range 加入 Selection
3. 执行 `document.exec('copy')` 的时候，由于选区是个光标位置，复制了个寂寞，粘贴板还是原来的复制内容，不会改变，如果原来是空，那粘贴出来的还是空
4. 既然执行了个寂寞，为啥 success 不为 `false` 呢？因为 MDN 说了执行成功或者失败和返回值毛关系没有，只有 `document.exec` 不被浏览器支持或未被启用才会返回 `false`。

> **Note**: `document.execCommand()` only returns `true` if it is invoked as part of a user interaction. You can't use it to verify browser support before calling a command. From Firefox 82, nested `document.execCommand()` calls will always return `false`.  —— [Document.execCommand()](https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand)

**解决方法是：使用 `selection.removeAllRanges`，在 `selection.addRange` 之前把原有的 Range 清干净就可以了。**

```ts
const copy = (text: string) => {
  const range = document.createRange()
  const selection = document.getSelection()

  const mark = document.createElement('span')
  mark.textContent = text

  document.body.appendChild(mark)

  range.selectNodeContents(mark)
  selection.removeAllRanges() // 移除调用前已经存在 Range
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
```

上面使用 `selection.removeAllRanges` 移除当前的 Range，这样就可以把要复制的 Range 加入到 Selection 中了。

## toggle-selection

上面虽然解决了不能复制的问题，但是会把原来选中的区域也整没了。比如用户选了一段文字，执行了 `copy` 导致原来的文字没有选中了。`copy` 函数就会有 side-effect 了，对应用不友好。

**解决方法也很简单：执行 `copy` 前移除当前选区，执行过后再恢复原来选区。**

```ts
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

  // deselect
  selection.removeAllRanges();

  return () => {
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
  }
}
```

`deselectCurrent` 函数将当前选区存在 `ranges` 里，最后返回一个函数，该函数可用于恢复当前选区。

另外，我们还要考虑到如果 `activeElement` 为 input 或 textarea 的情况，deselect 时要 blur，reselect 时则要 focus 回来。

```ts
export const deselectCurrent = () => {
  const selection = document.getSelection()

  if (selection.rangeCount === 0) {
    return () => {}
  }

  let $active = document.activeElement

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

  selection.removeAllRanges();

  return () => {
    if (selection.type === 'Caret') {
      selection.removeAllRanges()
    }
    if (selection.rangeCount === 0) {
      ranges.forEach(range => {
        selection.addRange(range)
      })
    }

    // input 或 textarea 要再 focus 回来
    if ($active) {
      ($active as HTMLInputElement | HTMLTextAreaElement).focus()
    }
  }
}
```

在 `copy` 里就可以愉快 deselect 和 reselect 了：

```ts
const copy = (text: string) => {
  const reselectPrevious = deselectCurrent() // 去掉当前选区

  ...

  const success = document.execCommand('copy')

  if (mark) {
    document.body.removeChild(mark)
  }

  reselectPrevious() // 恢复以前的选区

  return success
}
```

## onCopy

复制的时候将触发 copy 事件，因此这里还可以给调用方提供 `onCopy` 的回调，自定义 listener。

```ts
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

  // 自定义 onCopy
  mark.addEventListener('copy', (e) => {
    if (onCopy) {
      e.stopPropagation()
      e.preventDefault()
      onCopy(e.clipboardData)
    }
  })

  document.body.appendChild(mark)

  range.selectNodeContents(mark)
  selection.addRange(range)

  const success = document.execCommand('copy')

  if (mark) {
    document.body.removeChild(mark)
  }

  reselectPrevious()

  return success
}
```

这里添加了 "copy" 事件的监听。`e.stopPropagation` 阻止 copy 事件冒泡，`e.prevenDefault` 禁止默认响应，然后用 `onCopy` 函数接管复制事件的响应。同时，`onCopy` 里传入 `e.clipbaordData`，调用方可以随意处理复制的数据。

比如：

```ts
$myCopy.onclick = () => {
  const myText = 'my text'

  copy('xxx', {
    onCopy: (clipboardData) => clipboardData.setData('text/plain', myText), // 复制 'my-text'
  })
}
```

有人就会问了：这个 `setData` 好理解，不就设置复制文本嘛，那要这个 “text/plain" 干嘛用？

## DataTransfer 里的 format
不知道大家有没有关注过 `clipboardData` 类型呢？它其实是一个 `DataTransfer` 的类型，那 `DataTransfer` 又是干啥的？一般是拖拽时，用于存放拖拽内容的。复制也算是数据转移的一种，所以 `clipboardData` 也为 DataTransfer 类型。

复制本质上是复制内容而非单一的文本，也有格式的。我们可能学时一般就复制几个文字，但是在一些情况下，比如复制一个链接、一个 `<h1>` 标签的元素、甚至一张图片后，当粘贴到 docs 文件的时候，会发现这些元素的样式和图片全都带过来了。

为什么发生这样的事？因为在复制的时候系统会设定 format，而 World 正好可以识别这些 format，所以可以直接展示出带样式的复制内容。

目前我们的函数仅支持纯文本的复制，应该再加一个 `format`，让调用方自定义复制的格式。

```ts
interface Options {
  onCopy?: (copiedText: DataTransfer | null) => unknown
  format?: Format
}

const copy = (text: string, options: Options = {}) => {
  const {onCopy} = options

  const reselectPrevious = deselectCurrent()

  const range = document.createRange()
  const selection = document.getSelection()

  const mark = document.createElement('span')
  mark.textContent = text

  mark.addEventListener('copy', (e) => {
    e.stopPropagation();

    // 带格式去复制内容
    if (format) {
      e.preventDefault()
      e.clipboardData.clearData()
      e.clipboardData.setData(format, text)
    }

    if (onCopy) {
      e.preventDefault()
      onCopy(e.clipboardData)
    }
  })

  document.body.appendChild(mark)

  range.selectNodeContents(mark)
  selection.addRange(range)

  const success = document.execCommand('copy')

  if (mark) {
    document.body.removeChild(mark)
  }

  reselectPrevious()

  return success
}
```

在刚刚代码基础上，我们可以在 copy 事件里判断是否有 format，如果有则直接接管 copy listener，`clearData` 清除复制内容，然后 `setData(format, text)` 来复制内容。

## 兼容 IE

前端工程师们都会有一个共通的一生之敌——IE。目前查了文档，有以下兼容问题：

* 在 IE 11 下，format 这里只有 `Text` 和 `Url` 两种
* 在 IE 下，copy 事件中 `e.clipboardData` 为 `undefined`，但是会有 `window.clipboardData`
* 在 IE 9 以下，`document.execCommand` 可能不被支持（有些贴子说可以，有些贴子说有问题）

针对上面的问题，我们要为 `format`、`e.clipboardData` 和 `document.execCommand` 做好兜底兼容操作。

首先是 `format`，提供一个 format 的转换 Mapper：

```ts
type Format = 'text/plain' | 'text/html' | 'default'
type IE11Format = 'Text' | 'Url'

const clipboardToIE11Formatting: Record<Format, IE11Format> = {
  "text/plain": "Text",
  "text/html": "Url",
  "default": "Text"
}
```

接下来是 `e.clipboardData` 做兼容，这里有个知识点是在 IE 下，`window` 会有一个 `clipboardData`，我们可以把要复制的内容存到 `window.clipboardData`。**注意：这个全局变量只有 IE 下才会有，普通情况下还是使 `e.clipboardData`。**

```ts
const copy = (text: string, options: Options = {}) => {
  ...

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
      e.preventDefault()
      onCopy(e.clipboardData)
    }
  })

  ...
}
```

最后一步是对 `document.execCommand` 做兼容。目前我自己搜到的是会出现不生效的问题，以及 `execCommand` 不支持的问题，为了应对 IE 下绝大多的问题，我们可以祭出 try-catch 大法，只要有 error，通通走 IE 的老路子去做复制。

```ts
const copy = (text: string, options: Options = {}) => {
  ...…

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
```

上面加了好几个 try-catch，第一个兼容 `document.execCommand`，有问题走 `window.clipboardData.setData` 的方式来复制。第二个为兜底方案，使用 `window.prompt` 作为兜底。

最后 finally 里对 `selection.removeRange` 做了兼容，优先使用 `removeRange`，失败再使用 `removeAllRanges` 清除所有 Range。

## 兼容样式

在创建和添加 mark 时还要对其样式进行处理，防止页面出现 side-effect，比如：

* 添加和删除 mark 不能造成页面滚动
* span 元素的 space 和 line-break 要为 `pre`，复制时可以把换行等特殊符号也带上
* 外部有可能会被设置成 "none"，所以 user-select 一定要为 "text"，不然连选都选不中

```ts
const updateMarkStyles = (mark: HTMLSpanElement) => {
  // 重置用户样式
  mark.style.all = "unset";
  // 放在 fixed，防止添加元素后触发滚动行为
  mark.style.position = "fixed";
  mark.style.top = '0';
  mark.style.clip = "rect(0, 0, 0, 0)";
  // 保留 space 和 line-break 特性
  mark.style.whiteSpace = "pre";
  // 外部有可能 user-select 为 'none'，因此这里设置为 text
  mark.style.userSelect = "text";
}

const copy = (text: string, options: Options = {}) => {
  ...

  const mark = document.createElement('span')
  mark.textContent = text

  updateMarkStyles(mark)

  mark.addEventListener('copy', (e) => {
    ...
  })
  ...
}
```

在创建 span 元素之后应该马上更新样式，确保不会有页面变化（副作用）。

## 总结

目前已经完成 [copy-to-clipboard](https://www.npmjs.com/package/copy-to-clipboard) 这个库的所有功能了，主要做了以下几件事：

1. 完成复制功能
2. 复制后会恢复原来选区
3. 提供 onCopy，调用方可自己定义复制 listener
4. 提供 format，可多格式复制
5. 兼容了 IE
6. 对样式做了兼容，在不对页面产生副作用情况下完成复制功能

## 最后

JS 复制这个需求应该不少人都会遇到过。然而真正研究起来，要考虑的东西还是很多的。

如果仅仅只是扫一眼源码可能只会做出”从零开始“这一版，后面的兼容、format、回调等功能真的特别难想到。

最后再来说一下 **Clipboard API**。Clipboard API 是下一代的剪贴板操作方法，比传统的 document.execCommand() 方法更强大、更合理。它的所有操作都是异步的，返回 Promise 对象，不会造成页面卡顿。而且，它可以将任意内容（比如图片）放入剪贴板。

不过，目前还是 `document.execCommand` 使用的比较广泛。虽然上面也说了 IE 对 `document.execCommand` 不好，但是 Clipboard API 的兼容性更差，FireFox 和 Chome 在某些版本可能都会有问题。**另外还有一个问题，使用 clipboard API 需要从权限 [Permissions API](https://developer.mozilla.org/zh-CN/docs/Web/API/Permissions_API) 获取权限之后，才能访问剪贴板内容，这样会严重影响用户体验。用户：你让我开权限，是不是又想偷我密码？？？**
