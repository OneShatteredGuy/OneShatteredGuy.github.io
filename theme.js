const toggle = document.getElementById("theme-toggle");
const body = document.body;

toggle.addEventListener("click", () => {
  body.classList.toggle("light");
  body.classList.toggle("dark");

  if(body.classList.contains("light")) {
    toggle.textContent = "🌙 Dark Mode";
  } else {
    toggle.textContent = "🌞 Light Mode";
  }
});
