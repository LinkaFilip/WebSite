(() => {
  const SELECTOR = 'main#main';
  const ARTICLES_SELECTOR = 'main#main > article';

  const getPanelsData = () => {
    // projectsData.js may be loaded in different ways (global vs module).
    // Robustly handle cases where it is missing or loads after this script.

    // 1) Prefer a global already present
    if (Array.isArray(window.panels)) return window.panels;

    // 2) Try to read from DOM as a fallback (covers “script load order” issues)
    //    The page should have <article> elements already.
    const mainEl = document.querySelector(SELECTOR);
    if (!mainEl) return null;

    const domArticles = Array.from(mainEl.querySelectorAll(ARTICLES_SELECTOR));
    if (domArticles.length > 0) {
      // Minimal panel objects to keep carousel functional.
      // (If these fields are missing, buildArticle still renders title/img.)
      return domArticles.map((a) => {
        const titleEl = a.querySelector('.article-title-section h2 a') || a.querySelector('.article-title-section h2');
        const titleText = titleEl?.textContent?.trim() || '';
        const img = a.querySelector('img');
        return {
          title: titleText,
          linkHref: a.querySelector('.article-title-section h2 a')?.getAttribute('href') || null,
          descriptionHtml: a.querySelector('.article-description-section p')?.innerHTML || '',
          imageSrc: img?.getAttribute('src') || '',
          imageAlt: img?.getAttribute('alt') || titleText,
          imageId: 'random',
          extraClassForArticle: a.className || '',
          cta: null,
        };
      });
    }

    return null;
  };

  // Expose for debugging (remove later if you want)
  window.__getPanelsData = getPanelsData;

  // Helpful runtime diagnostics: avoids “it runs but nothing appears”.
  const debugInit = () => {
    const mainEl = document.querySelector(SELECTOR);
    const domCount = mainEl ? mainEl.querySelectorAll(ARTICLES_SELECTOR).length : 0;
    const dataAvailable = Array.isArray(window.panels);
    // eslint-disable-next-line no-console
    console.log('[carousel debug]', { domCount, dataAvailable, panelsType: typeof window.panels, panelsIsArray: dataAvailable });
  };

  // Run once after DOM is ready.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      debugInit();
      // Try to initialize immediately so we can see something without waiting.
      try {
        initCarouselFromDom();
      } catch (e) {
        console.error('[carousel debug] initCarouselFromDom failed', e);
      }
    }, { once: true });
  } else {
    debugInit();
    try {
      initCarouselFromDom();
    } catch (e) {
      console.error('[carousel debug] initCarouselFromDom failed', e);
    }
  }


  const buildArticle = (panel, index) => {
    const article = document.createElement('article');
    article.dataset.index = String(index);
    article.dataset.status = index === 1 ? 'active' : 'inactive';

    if (panel.extraClassForArticle) article.className = panel.extraClassForArticle;

    const descSection = document.createElement('div');
    descSection.className = 'article-description-section article-section';

    const p = document.createElement('p');
    p.innerHTML = panel.descriptionHtml;
    descSection.appendChild(p);

    const ctaBtn = panel.cta;
    if (ctaBtn) {
      const btn = document.createElement('button');
      btn.className = 'button';
      btn.type = 'button';
      btn.innerHTML = ctaBtn.html;
      descSection.appendChild(btn);
    }

    const imgSection = document.createElement('div');
    imgSection.className = 'article-image-section article-section';
    imgSection.id = panel.imageId || 'random';

    const img = document.createElement('img');
    img.src = panel.imageSrc;
    img.loading = 'lazy';
    img.alt = panel.imageAlt || panel.title;
    imgSection.appendChild(img);

    const navSection = document.createElement('div');
    navSection.className = 'article-nav-section article-section';

    const leftBtn = document.createElement('button');
    leftBtn.className = 'article-nav-button';
    leftBtn.type = 'button';
    leftBtn.innerHTML = '<span>←</span>';
    leftBtn.onclick = () => window.handleLeftClick();

    const rightBtn = document.createElement('button');
    rightBtn.className = 'article-nav-button';
    rightBtn.type = 'button';
    rightBtn.innerHTML = '<span>→</span>';
    rightBtn.onclick = () => window.handleRightClick();

    navSection.appendChild(leftBtn);
    navSection.appendChild(rightBtn);

    const titleSection = document.createElement('div');
    titleSection.className = 'article-title-section article-section';

    const h2 = document.createElement('h2');
    h2.textContent = panel.title;
    titleSection.appendChild(h2);

    if (panel.linkHref) {
      const a = document.createElement('a');
      a.href = panel.linkHref;
      a.textContent = panel.title;
      h2.textContent = '';
      h2.appendChild(a);
    }

    article.appendChild(descSection);
    article.appendChild(imgSection);
    article.appendChild(navSection);
    article.appendChild(titleSection);

    return article;
  };

  const syncActiveClass = (articles) => {
    articles.forEach((el) => {
      const isActive = el.dataset.status === 'active';
      el.classList.toggle('active', isActive);
    });
  };

  const initCarouselFromDom = () => {
    const mainEl = document.querySelector(SELECTOR);
    if (!mainEl) return;

    // If DOM already has articles, use them. Otherwise build from data.
    let articles = Array.from(mainEl.querySelectorAll(ARTICLES_SELECTOR));
    if (articles.length === 0) {
      const data = getPanelsData();
      if (!data) {
        console.warn('[carousel] No panels in DOM and no panel data found (window.panels).');
        return;
      }

      // Build panels.
      const frag = document.createDocumentFragment();
      data.forEach((panel, i) => {
        frag.appendChild(buildArticle(panel, i + 1));
      });
      mainEl.appendChild(frag);
      articles = Array.from(mainEl.querySelectorAll(ARTICLES_SELECTOR));
    }

    // Assign sequential data-index.
    articles.forEach((el, i) => {
      el.dataset.index = String(i + 1);
    });

    const N = articles.length;
    if (N === 0) return;

    // Ensure startup active panel.
    const activeArticle = articles.find((el) => el.dataset.status === 'active') || articles[0];
    activeArticle.dataset.status = 'active';

    // Sync `.active` class so the UI shows immediately.
    syncActiveClass(articles);

    let activeIndex = Number(activeArticle.dataset.index);
    const slideByIndex = new Map(articles.map((el) => [Number(el.dataset.index), el]));

    const transition = (nextIndex, direction) => {
      const currentSlide = slideByIndex.get(activeIndex);
      const nextSlide = slideByIndex.get(nextIndex);
      if (!currentSlide || !nextSlide) return;

      if (
        currentSlide.dataset.status === 'becoming-active-from-before' ||
        currentSlide.dataset.status === 'becoming-active-from-after'
      ) {
        return;
      }

      if (direction === 'left') {
        currentSlide.dataset.status = 'after';
        nextSlide.dataset.status = 'becoming-active-from-before';
      } else {
        currentSlide.dataset.status = 'before';
        nextSlide.dataset.status = 'becoming-active-from-after';
      }

      requestAnimationFrame(() => {
        nextSlide.dataset.status = 'active';
        activeIndex = nextIndex;
        syncActiveClass(articles);
      });
    };

    window.handleLeftClick = () => transition(((activeIndex - 2 + N) % N) + 1, 'left');
    window.handleRightClick = () => transition((activeIndex % N) + 1, 'right');
  };

})();


