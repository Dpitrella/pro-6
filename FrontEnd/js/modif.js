const openModal = function (e) {
    e.preventDefault()
    const target = document.querySelector  (e.target.getAttribute('href'))
    target.style.display = null;
}


document.querySelectorAll('.js-modale').forEach(a => {
    a.addEventListener('click', openModal)
})