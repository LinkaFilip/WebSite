let activeIndex = 0;

const article = document.getElementsByTagName("article");
const element = document.getElementById("#toggle");

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

function functionToggle() {
  const element = document.querySelector('.light-mode, .dark-mode');
  if (!element) return; // ochrana proti null

  if (element.classList.contains('light-mode')) {
    element.classList.replace('light-mode', 'dark-mode');
  } else {
    element.classList.replace('dark-mode', 'light-mode');
  }
}