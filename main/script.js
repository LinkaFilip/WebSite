(() => {
  const SELECTOR = 'main#main > article';

  const initCarousel = () => {
    const articles = Array.from(document.querySelectorAll(SELECTOR));

    if (articles.length === 0) return;

    // Auto-assign data-index based on DOM order (uncommented/real articles only).
    articles.forEach((el, i) => {
      el.dataset.index = String(i + 1);
    });

    const activeArticle = articles.find((el) => el.dataset.status === 'active') || articles[0];
    let activeIndex = Number(activeArticle.dataset.index);
    const N = articles.length;

    // Generalized data structure (generated from markup).
    const articlesData = articles.map((el) => {
      const h2 = el.querySelector('h2');
      const aInTitle = h2 ? h2.querySelector('a') : null;
      const img = el.querySelector('img');
      const p = el.querySelector('p');

      return {
        index: Number(el.dataset.index),
        name: aInTitle ? aInTitle.textContent.trim() : (h2 ? h2.textContent.trim() : ''),
        link: aInTitle ? aInTitle.getAttribute('href') : null,
        description: p ? p.innerHTML.trim() : '',
        image: img ? img.getAttribute('src') : null,
        imageAlt: img ? img.getAttribute('alt') : null,
      };
    });

    // Expose for debugging/possible future use.
    window.articlesData = articlesData;

    window.handleLeftClick = () => {
      const nextIndex = ((activeIndex - 2 + N) % N) + 1;
      const currentSlide = document.querySelector(`[data-index="${activeIndex}"]`);
      const nextSlide = document.querySelector(`[data-index="${nextIndex}"]`);

      if (!currentSlide || !nextSlide) return;

      currentSlide.dataset.status = 'after';
      nextSlide.dataset.status = 'becoming-active-from-before';

      setTimeout(() => {
        nextSlide.dataset.status = 'active';
        activeIndex = nextIndex;
      }, 0);
    };

    window.handleRightClick = () => {
      const nextIndex = (activeIndex % N) + 1;
      const currentSlide = document.querySelector(`[data-index="${activeIndex}"]`);
      const nextSlide = document.querySelector(`[data-index="${nextIndex}"]`);

      if (!currentSlide || !nextSlide) return;

      currentSlide.dataset.status = 'before';
      nextSlide.dataset.status = 'becoming-active-from-after';

      setTimeout(() => {
        nextSlide.dataset.status = 'active';
        activeIndex = nextIndex;
      }, 0);
    };
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel, { once: true });
  } else {
    initCarousel();
  }
})();

