const themeButton = document.querySelector('.darkmodeToggle button');


if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light-mode');
  themeButton.textContent = '🌙 Dark Mode';
} else {
  themeButton.textContent = '💡 Light Mode';
}

themeButton.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');

  if (document.body.classList.contains('light-mode')) {
    themeButton.textContent = '🌙';
    localStorage.setItem('theme', 'light'); // save choice
  } else {
    themeButton.textContent = '💡';
    localStorage.setItem('theme', 'dark');
  }
});
✅ What this does:
