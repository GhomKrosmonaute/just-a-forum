function emojiOnClick(target, emoji) {
  const textArea = document.getElementById(target)
  textArea.value = textArea.value + emoji
  textArea.focus()
}
