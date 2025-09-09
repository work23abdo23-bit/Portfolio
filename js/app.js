const getElement = (selector) => {
  const element = document.querySelector(selector)

  if (element) return element
  throw Error(
    `Please double check your class names, there is no ${selector} class`
  )
}

const links = getElement('.nav-links')
const navBtnDOM = getElement('.nav-btn')

navBtnDOM.addEventListener('click', () => {
  links.classList.toggle('show-links')
})

const date = getElement('#date')
const currentYear = new Date().getFullYear()
date.textContent = currentYear




let up = document.querySelector(".up-button");

window.onscroll = function() {
    if (window.scrollY >= 800) {
up.style.display = "block"
    } else if (window.scrollY <= 900) {
up.style.display = "none"

    };
}

up.onclick = function() {
 window.scrollTo({
    left: 0,
    top:0,
    behavior:"smooth"
 })   
}




