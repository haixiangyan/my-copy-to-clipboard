(()=>{"use strict";var e={"text/plain":"Text","text/html":"Url",default:"Text"};const t=function(t,a){void 0===a&&(a={});var n=a.onCopy,o=a.format,r=!1,c=function(){var e=document.getSelection();if(0===e.rangeCount)return function(){};for(var t=document.activeElement,a=[],n=0;n<e.rangeCount;n++)a.push(e.getRangeAt(n));switch(t.tagName.toUpperCase()){case"INPUT":case"TEXTAREA":t.blur();break;default:t=null}return e.removeAllRanges(),function(){"Caret"===e.type&&e.removeAllRanges(),0===e.rangeCount&&a.forEach((function(t){e.addRange(t)})),t&&t.focus()}}(),l=document.createRange(),i=document.getSelection(),u=document.createElement("span");!function(e){e.style.all="unset",e.style.position="fixed",e.style.top="0",e.style.clip="rect(0, 0, 0, 0)",e.style.whiteSpace="pre",e.style.userSelect="text"}(u),u.textContent=t,u.addEventListener("copy",(function(a){if(a.stopPropagation(),o)if(a.preventDefault(),a.clipboardData)a.clipboardData.clearData(),a.clipboardData.setData(o,t);else{var r=e[o||"default"];window.clipboardData.clearData(),window.clipboardData.setData(r,t)}n&&(a.stopPropagation(),a.preventDefault(),n(a.clipboardData))})),document.body.appendChild(u),l.selectNodeContents(u),i.addRange(l);try{if(!(r=document.execCommand("copy")))throw new Error("Can't not copy")}catch(e){try{window.clipboardData.setData(o||"text",t),n&&n(window.clipboardData)}catch(e){window.prompt("输入需要复制的内容",t)}}finally{i.removeRange?i.removeRange(l):i.removeAllRanges(),u&&document.body.removeChild(u),c()}return r};var a=document.querySelector("#copy"),n=document.querySelector("#my-copy");a.onclick=function(){var e=document.querySelector("#text").innerText;t(e)},n.onclick=function(){var e=document.querySelector("#my-text").innerText;t("xxx",{onCopy:function(t){return t.setData("text/plain",e)}})}})();
//# sourceMappingURL=index.07c7a931960f0b321456.js.map