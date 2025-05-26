let activeIndex = 0;

const article = document.getElementsByTagName("article");

const handleLeftClick = () => {
  const nextIndex = activeIndex - 1 >= 0 ? activeIndex - 1 : article.length - 1;

  const currentSlide = document.querySelector(`[data-index="${activeIndex}"]`),
    nextSlide = document.querySelector(`[data-index="${nextIndex}"]`);

  currentSlide.dataset.status = "after";

  nextSlide.dataset.status = "becoming-active-from-before";

  setTimeout(() => {
    nextSlide.dataset.status = "active";
    activeIndex = nextIndex;
  }, 0);
}

const handleRightClick = () => {
  const nextIndex = activeIndex + 1 <= article.length - 1 ? activeIndex + 1 : 0;

  const currentSlide = document.querySelector(`[data-index="${activeIndex}"]`),
    nextSlide = document.querySelector(`[data-index="${nextIndex}"]`);

  currentSlide.dataset.status = "before";

  nextSlide.dataset.status = "becoming-active-from-after";

  setTimeout(() => {
    nextSlide.dataset.status = "active";
    activeIndex = nextIndex;
  }, 0);
}
const image = document.querySelector("img");

  const element = document.getElementById('random');

function functionToggle() {
  const element = document.querySelector('.light-mode, .dark-mode');
  if (!element) return;

  // Přepnutí třídy
  if (element.classList.contains('light-mode')) {
    element.classList.replace('light-mode', 'dark-mode');
  } else {
    element.classList.replace('dark-mode', 'light-mode');
  }

  // Invertuj barvy u všech obrázků, pokud je dark mode aktivní
  const images = document.querySelectorAll("img");
  if (element.classList.contains("dark-mode")) {
    images.forEach(img => {
      img.style.filter = "invert(100%)";
    });
  } else {
    images.forEach(img => {
      img.style.filter = "invert(0%)";
    });
  }
  
  element.style.backgroundColor = '#90ee90'; // světle zelená
}