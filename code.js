document.addEventListener('DOMContentLoaded', () => {
  const themeButton = document.querySelector('.darkmodeToggle button');

  if (!themeButton) return;

  
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    themeButton.textContent = '🌙';
  } else {
    document.body.classList.remove('light-mode');
    themeButton.textContent = '💡';
  }

  // Toggle theme on click
  themeButton.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');

    if (document.body.classList.contains('light-mode')) {
      themeButton.textContent = '🌙';
      localStorage.setItem('theme', 'light');
    } else {
      themeButton.textContent = '💡';
      localStorage.setItem('theme', 'dark');
    }
  });
});
