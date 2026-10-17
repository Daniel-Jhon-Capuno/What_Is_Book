import { LiteraryWork, BookWork, PoemWork, QuoteWork } from '../types';

export function generateStandaloneBookHtml(work: LiteraryWork): string {
  if (work.type === 'book') {
    return generateBookReaderHtml(work);
  } else if (work.type === 'poem') {
    return generatePoemReaderHtml(work);
  } else {
    return generateQuoteReaderHtml(work);
  }
}

export function downloadHtmlFile(work: LiteraryWork) {
  const htmlContent = generateStandaloneBookHtml(work);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeTitle = (work.type === 'quote' ? (work.maker || 'Quote') : (work.title || 'Work'))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, 30);
  a.href = url;
  a.download = `${work.type}_${safeTitle}_reader.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string = ''): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatParagraphs(text: string = ''): string {
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map((p, idx) => `<p class="${idx === 0 ? 'dropcap' : ''}">${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
    .join('\n');
}

function generateBookReaderHtml(book: BookWork): string {
  const pagesData = [
    {
      type: 'cover',
      title: book.title,
      subtitle: book.subtitle || '',
      author: book.author || 'Anonymous',
      year: book.year || '',
      genre: book.genre || 'Book'
    },
    {
      type: 'about',
      title: 'About & Context',
      content: book.about || 'No context provided.',
      dedication: book.dedication || ''
    },
    ...book.chapters.map((ch, idx) => ({
      type: 'chapter',
      number: idx + 1,
      title: ch.title,
      subtitle: ch.subtitle || '',
      content: ch.content
    }))
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(book.title)} — Interactive Book Simulation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --morning-paper: #F5FBE6;
      --morning-paper-dark: #e8f1d3;
      --silent-grove: #215E61;
      --silent-grove-light: #2c7c80;
      --blue-monolith: #233D4D;
      --blue-monolith-muted: #536d7d;
      --page-shadow: 0 15px 35px -5px rgba(35, 61, 77, 0.2), 0 0 0 1px rgba(33, 94, 97, 0.12);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--morning-paper);
      color: var(--blue-monolith);
      font-family: 'EB Garamond', Georgia, serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      background-image: 
        radial-gradient(#215E6108 1px, transparent 1px),
        radial-gradient(#233D4D05 1px, #F5FBE6 1px);
      background-size: 20px 20px;
    }

    /* Top navigation bar */
    .reader-header {
      background: rgba(245, 251, 230, 0.95);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid rgba(33, 94, 97, 0.15);
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 50;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .brand-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--silent-grove);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn {
      background: transparent;
      border: 1px solid var(--silent-grove);
      color: var(--silent-grove);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .btn:hover {
      background: var(--silent-grove);
      color: var(--morning-paper);
    }

    /* Simulation stage */
    .stage {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px 60px;
      perspective: 1800px;
    }

    .book-wrapper {
      width: 100%;
      max-width: 900px;
      min-height: 600px;
      background: var(--morning-paper);
      border-radius: 6px;
      box-shadow: var(--page-shadow);
      border: 1px solid rgba(33, 94, 97, 0.2);
      display: flex;
      position: relative;
      overflow: hidden;
    }

    /* Book center spine crease */
    .book-spine-crease {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: 40px;
      margin-left: -20px;
      background: linear-gradient(to right, 
        rgba(35, 61, 77, 0.0) 0%, 
        rgba(35, 61, 77, 0.12) 48%, 
        rgba(33, 94, 97, 0.18) 50%, 
        rgba(35, 61, 77, 0.12) 52%, 
        rgba(35, 61, 77, 0.0) 100%
      );
      pointer-events: none;
      z-index: 10;
    }

    .book-page {
      flex: 1;
      padding: 48px 44px;
      display: flex;
      flex-direction: column;
      position: relative;
      min-height: 560px;
      overflow-y: auto;
    }

    .page-left {
      border-right: 1px solid rgba(33, 94, 97, 0.1);
      box-shadow: inset -15px 0 25px -10px rgba(35, 61, 77, 0.05);
    }

    .page-right {
      box-shadow: inset 15px 0 25px -10px rgba(35, 61, 77, 0.05);
    }

    .page-header {
      font-family: 'Cinzel', serif;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--silent-grove);
      text-align: center;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(33, 94, 97, 0.12);
      margin-bottom: 28px;
    }

    .page-footer {
      margin-top: auto;
      padding-top: 16px;
      font-size: 13px;
      color: var(--blue-monolith-muted);
      text-align: center;
      font-style: italic;
    }

    /* Cover Styling */
    .cover-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 30px 20px;
      border: 2px solid var(--silent-grove);
      background: rgba(33, 94, 97, 0.03);
      position: relative;
    }

    .cover-container::after {
      content: '';
      position: absolute;
      inset: 6px;
      border: 1px dashed rgba(33, 94, 97, 0.3);
      pointer-events: none;
    }

    .cover-genre {
      font-family: 'Cinzel', serif;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.25em;
      color: var(--silent-grove);
      margin-bottom: 24px;
    }

    .cover-title {
      font-family: 'Cinzel', serif;
      font-size: 32px;
      font-weight: 700;
      color: var(--blue-monolith);
      line-height: 1.2;
      margin-bottom: 14px;
    }

    .cover-subtitle {
      font-size: 17px;
      color: var(--silent-grove);
      font-style: italic;
      margin-bottom: 36px;
      max-width: 80%;
      line-height: 1.4;
    }

    .cover-author {
      font-family: 'Cinzel', serif;
      font-size: 15px;
      letter-spacing: 0.15em;
      color: var(--blue-monolith);
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .cover-flourish {
      width: 48px;
      height: 1px;
      background: var(--silent-grove);
      margin: 16px auto;
      position: relative;
    }
    .cover-flourish::before {
      content: '✦';
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 10px;
      color: var(--silent-grove);
      background: var(--morning-paper);
      padding: 0 4px;
    }

    /* Content styling */
    .chapter-heading {
      font-family: 'Cinzel', serif;
      font-size: 20px;
      color: var(--silent-grove);
      text-align: center;
      margin-bottom: 8px;
      font-weight: 700;
    }

    .chapter-sub {
      text-align: center;
      font-style: italic;
      color: var(--blue-monolith-muted);
      margin-bottom: 24px;
      font-size: 14px;
    }

    .prose {
      font-size: 16.5px;
      line-height: 1.8;
      color: var(--blue-monolith);
      text-align: justify;
      hyphens: auto;
    }

    .prose p {
      margin-bottom: 1.25em;
      text-indent: 1.5em;
    }

    .prose p.dropcap {
      text-indent: 0;
    }

    .dropcap::first-letter {
      font-family: 'Cinzel', serif;
      float: left;
      font-size: 3.2em;
      line-height: 0.8;
      padding: 4px 8px 0 0;
      color: var(--silent-grove);
      font-weight: 700;
    }

    /* Table of contents sidebar drawer */
    .toc-drawer {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 320px;
      background: var(--morning-paper);
      box-shadow: 5px 0 25px rgba(35, 61, 77, 0.2);
      z-index: 100;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      padding: 30px 24px;
      overflow-y: auto;
      border-right: 1px solid rgba(33, 94, 97, 0.2);
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .toc-drawer.open {
      transform: translateX(0);
    }

    .toc-title {
      font-family: 'Cinzel', serif;
      font-size: 18px;
      color: var(--silent-grove);
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(33, 94, 97, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .toc-list {
      list-style: none;
    }

    .toc-item {
      padding: 10px 12px;
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 6px;
      font-size: 14px;
      color: var(--blue-monolith);
      transition: all 0.15s ease;
      display: flex;
      justify-content: space-between;
    }

    .toc-item:hover, .toc-item.active {
      background: rgba(33, 94, 97, 0.1);
      color: var(--silent-grove);
      font-weight: 600;
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(35, 61, 77, 0.3);
      backdrop-filter: blur(2px);
      z-index: 90;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .overlay.open {
      opacity: 1;
      pointer-events: auto;
    }

    /* Floating Navigation Controls */
    .nav-arrow {
      position: fixed;
      top: 50%;
      transform: translateY(-50%);
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--morning-paper);
      border: 1px solid rgba(33, 94, 97, 0.3);
      color: var(--silent-grove);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(35, 61, 77, 0.1);
      transition: all 0.2s ease;
      z-index: 40;
    }

    .nav-arrow:hover {
      background: var(--silent-grove);
      color: var(--morning-paper);
      transform: translateY(-50%) scale(1.08);
    }

    .nav-prev { left: 24px; }
    .nav-next { right: 24px; }

    @media (max-width: 820px) {
      .book-wrapper { flex-direction: column; min-height: auto; }
      .book-spine-crease { display: none; }
      .page-left { border-right: none; border-bottom: 1px solid rgba(33, 94, 97, 0.1); }
      .nav-arrow { display: none; }
    }

    @media print {
      .reader-header, .nav-arrow, .toc-drawer, .overlay { display: none !important; }
      .book-wrapper { box-shadow: none; border: none; }
      body { background: #fff !important; }
    }
  </style>
</head>
<body>

  <!-- Top bar -->
  <header class="reader-header">
    <div class="brand-title">
      <span>📖</span>
      <span>${escapeHtml(book.title)}</span>
    </div>
    <div class="header-controls">
      <button class="btn" onclick="toggleToc()">☰ Table of Contents</button>
      <button class="btn" onclick="window.print()">🖨️ Print Book</button>
    </div>
  </header>

  <!-- Table of Contents Drawer -->
  <div class="overlay" id="overlay" onclick="toggleToc()"></div>
  <aside class="toc-drawer" id="tocDrawer">
    <div class="toc-title">
      <span>Contents</span>
      <span style="cursor:pointer; font-size: 16px;" onclick="toggleToc()">✕</span>
    </div>
    <ul class="toc-list" id="tocList"></ul>
  </aside>

  <!-- Floating Nav Buttons -->
  <button class="nav-arrow nav-prev" onclick="prevSpread()" title="Previous Pages">❮</button>
  <button class="nav-arrow nav-next" onclick="nextSpread()" title="Next Pages">❯</button>

  <!-- Simulation Stage -->
  <main class="stage">
    <div class="book-wrapper">
      <div class="book-spine-crease"></div>
      
      <!-- Left Page -->
      <article class="book-page page-left" id="pageLeft">
        <!-- Rendered via JS -->
      </article>

      <!-- Right Page -->
      <article class="book-page page-right" id="pageRight">
        <!-- Rendered via JS -->
      </article>
    </div>
  </main>

  <script>
    const pages = ${JSON.stringify(pagesData)};
    let currentSpread = 0; // Each spread shows 2 pages: (spread * 2) and (spread * 2 + 1)
    const totalSpreads = Math.ceil(pages.length / 2);

    function renderPage(page, pageNum) {
      if (!page) {
        return '<div style="flex:1; display:flex; align-items:center; justify-content:center; color:rgba(33,94,97,0.3); font-style:italic;">[End of Volume]</div><div class="page-footer"></div>';
      }

      let contentHtml = '';

      if (page.type === 'cover') {
        contentHtml = \`
          <div class="cover-container">
            <div class="cover-genre">\${escape(page.genre)}</div>
            <h1 class="cover-title">\${escape(page.title)}</h1>
            \${page.subtitle ? \`<div class="cover-subtitle">\${escape(page.subtitle)}</div>\` : ''}
            <div class="cover-flourish"></div>
            <div class="cover-author">By \${escape(page.author)}</div>
            \${page.year ? \`<div style="font-size:13px; color:var(--silent-grove); margin-top:8px;">\${escape(page.year)}</div>\` : ''}
          </div>
        \`;
      } else if (page.type === 'about') {
        contentHtml = \`
          <div class="page-header">Context & Dedication</div>
          \${page.dedication ? \`
            <div style="font-style:italic; text-align:center; padding:18px 24px; margin-bottom:28px; background:rgba(33,94,97,0.04); border-left:2px solid var(--silent-grove); color:var(--silent-grove);">
              "\${escape(page.dedication)}"
            </div>
          \` : ''}
          <div class="chapter-heading" style="font-size:16px; margin-bottom:12px;">About This Work</div>
          <div class="prose" style="font-size:15px;">\${formatText(page.content)}</div>
        \`;
      } else if (page.type === 'chapter') {
        contentHtml = \`
          <div class="page-header">\${escape(bookTitle)}</div>
          <h2 class="chapter-heading">Chapter \${page.number}: \${escape(page.title)}</h2>
          \${page.subtitle ? \`<div class="chapter-sub">\${escape(page.subtitle)}</div>\` : ''}
          <div class="prose">\${formatText(page.content)}</div>
        \`;
      }

      return contentHtml + \`<div class="page-footer">— \${pageNum} —</div>\`;
    }

    const bookTitle = ${JSON.stringify(book.title)};

    function escape(s) {
      if (!s) return '';
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function formatText(s) {
      if (!s) return '';
      return s.split(/\\n\\s*\\n/).map((p, idx) => {
        const cls = idx === 0 ? 'dropcap' : '';
        return '<p class="' + cls + '">' + escape(p).replace(/\\n/g, '<br/>') + '</p>';
      }).join('');
    }

    function updateReader() {
      const leftIdx = currentSpread * 2;
      const rightIdx = currentSpread * 2 + 1;

      document.getElementById('pageLeft').innerHTML = renderPage(pages[leftIdx], leftIdx + 1);
      document.getElementById('pageRight').innerHTML = renderPage(pages[rightIdx], rightIdx + 1);

      updateTocActive();
    }

    function nextSpread() {
      if (currentSpread < totalSpreads - 1) {
        currentSpread++;
        updateReader();
      }
    }

    function prevSpread() {
      if (currentSpread > 0) {
        currentSpread--;
        updateReader();
      }
    }

    function goToPage(pageIndex) {
      currentSpread = Math.floor(pageIndex / 2);
      updateReader();
      toggleToc(false);
    }

    function toggleToc(forceState) {
      const drawer = document.getElementById('tocDrawer');
      const overlay = document.getElementById('overlay');
      const shouldOpen = forceState !== undefined ? forceState : !drawer.classList.contains('open');
      drawer.classList.toggle('open', shouldOpen);
      overlay.classList.toggle('open', shouldOpen);
    }

    function buildToc() {
      const list = document.getElementById('tocList');
      list.innerHTML = '';
      pages.forEach((p, idx) => {
        let label = '';
        if (p.type === 'cover') label = 'Title Page';
        else if (p.type === 'about') label = 'About & Dedication';
        else if (p.type === 'chapter') label = 'Chapter ' + p.number + ': ' + p.title;

        const li = document.createElement('li');
        li.className = 'toc-item';
        li.dataset.page = idx;
        li.innerHTML = '<span>' + label + '</span><span style="opacity:0.6;">p. ' + (idx + 1) + '</span>';
        li.onclick = () => goToPage(idx);
        list.appendChild(li);
      });
    }

    function updateTocActive() {
      const items = document.querySelectorAll('.toc-item');
      const activeStart = currentSpread * 2;
      items.forEach((item, idx) => {
        item.classList.toggle('active', idx === activeStart || idx === activeStart + 1);
      });
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        nextSpread();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevSpread();
      } else if (e.key === 'Escape') {
        toggleToc(false);
      }
    });

    buildToc();
    updateReader();
  </script>
</body>
</html>`;
}

function generatePoemReaderHtml(poem: PoemWork): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(poem.title)} — Poetry Broadsheet</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Marck+Script&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --morning-paper: #F5FBE6;
      --silent-grove: #215E61;
      --blue-monolith: #233D4D;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--morning-paper);
      color: var(--blue-monolith);
      font-family: 'EB Garamond', Georgia, serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px 80px;
      background-image: 
        radial-gradient(#215E6108 1px, transparent 1px),
        radial-gradient(#233D4D05 1px, #F5FBE6 1px);
      background-size: 20px 20px;
    }

    .toolbar {
      width: 100%;
      max-width: 680px;
      display: flex;
      justify-content: flex-end;
      margin-bottom: 24px;
      gap: 12px;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .btn {
      background: transparent;
      border: 1px solid var(--silent-grove);
      color: var(--silent-grove);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .btn:hover { background: var(--silent-grove); color: var(--morning-paper); }

    .broadsheet {
      width: 100%;
      max-width: 680px;
      background: var(--morning-paper);
      border: 2px solid var(--silent-grove);
      box-shadow: 0 15px 35px -5px rgba(35, 61, 77, 0.2);
      padding: 60px 48px;
      position: relative;
    }

    .broadsheet::before {
      content: '';
      position: absolute;
      inset: 8px;
      border: 1px solid rgba(33, 94, 97, 0.25);
      pointer-events: none;
    }

    .poem-form {
      font-family: 'Cinzel', serif;
      font-size: 12px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--silent-grove);
      text-align: center;
      margin-bottom: 16px;
    }

    .poem-title {
      font-family: 'Cinzel', serif;
      font-size: 32px;
      color: var(--blue-monolith);
      text-align: center;
      margin-bottom: 8px;
      font-weight: 700;
    }

    .poem-poet {
      font-size: 16px;
      color: var(--silent-grove);
      text-align: center;
      font-style: italic;
      margin-bottom: 24px;
    }

    .flourish {
      width: 60px;
      height: 1px;
      background: var(--silent-grove);
      margin: 0 auto 36px;
      position: relative;
    }
    .flourish::after {
      content: '❦';
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 14px;
      color: var(--silent-grove);
      background: var(--morning-paper);
      padding: 0 6px;
    }

    .stanzas {
      font-size: 18px;
      line-height: 2.1;
      color: var(--blue-monolith);
      margin-bottom: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .stanza {
      margin-bottom: 1.8em;
      white-space: pre-line;
    }

    .signature-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid rgba(33, 94, 97, 0.2);
      padding-top: 24px;
      margin-top: 36px;
    }

    .date-location {
      font-size: 14px;
      color: rgba(35, 61, 77, 0.7);
      font-style: italic;
    }

    .poet-signature {
      font-family: 'Marck Script', cursive;
      font-size: 26px;
      color: var(--silent-grove);
    }

    .about-box {
      margin-top: 36px;
      padding: 20px;
      background: rgba(33, 94, 97, 0.04);
      border-left: 2px solid var(--silent-grove);
      font-size: 14px;
      line-height: 1.6;
      color: var(--blue-monolith);
    }

    @media print {
      .toolbar { display: none !important; }
      body { padding: 0 !important; background: #fff !important; }
      .broadsheet { box-shadow: none; border: 1px solid #333; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button class="btn" onclick="window.print()">🖨️ Print Poem</button>
  </div>

  <main class="broadsheet">
    ${poem.form ? `<div class="poem-form">${escapeHtml(poem.form)}</div>` : ''}
    <h1 class="poem-title">${escapeHtml(poem.title)}</h1>
    <div class="poem-poet">by ${escapeHtml(poem.poet || 'Anonymous')}</div>
    <div class="flourish"></div>

    <div class="stanzas">
      ${poem.body.split(/\n\s*\n/).map(s => `<div class="stanza">${escapeHtml(s)}</div>`).join('')}
    </div>

    <div class="signature-row">
      <div class="date-location">${escapeHtml(poem.dateOrLocation || '')}</div>
      <div class="poet-signature">${escapeHtml(poem.poet || 'Anonymous')}</div>
    </div>

    ${poem.about ? `
      <div class="about-box">
        <strong style="color:var(--silent-grove); display:block; margin-bottom:6px; font-family:'Cinzel', serif; font-size:12px; letter-spacing:0.1em; text-transform:uppercase;">Context & Inscription:</strong>
        ${escapeHtml(poem.about)}
      </div>
    ` : ''}
  </main>
</body>
</html>`;
}

function generateQuoteReaderHtml(quote: QuoteWork): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote by ${escapeHtml(quote.maker)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --morning-paper: #F5FBE6;
      --silent-grove: #215E61;
      --blue-monolith: #233D4D;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--morning-paper);
      color: var(--blue-monolith);
      font-family: 'EB Garamond', Georgia, serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px 20px;
      background-image: 
        radial-gradient(#215E6108 1px, transparent 1px),
        radial-gradient(#233D4D05 1px, #F5FBE6 1px);
      background-size: 20px 20px;
    }

    .card {
      width: 100%;
      max-width: 600px;
      background: var(--morning-paper);
      border: 2px solid var(--silent-grove);
      padding: 60px 48px;
      position: relative;
      box-shadow: 0 15px 35px -5px rgba(35, 61, 77, 0.2);
      text-align: center;
    }

    .card::after {
      content: '';
      position: absolute;
      inset: 8px;
      border: 1px dashed rgba(33, 94, 97, 0.25);
      pointer-events: none;
    }

    .quote-mark {
      font-family: 'Cinzel', serif;
      font-size: 64px;
      line-height: 1;
      color: var(--silent-grove);
      opacity: 0.35;
      margin-bottom: 8px;
    }

    .quote-text {
      font-size: 23px;
      line-height: 1.6;
      color: var(--blue-monolith);
      font-style: italic;
      margin-bottom: 32px;
    }

    .divider {
      width: 50px;
      height: 1px;
      background: var(--silent-grove);
      margin: 0 auto 24px;
    }

    .maker-name {
      font-family: 'Cinzel', serif;
      font-size: 16px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--silent-grove);
      font-weight: 700;
      margin-bottom: 6px;
    }

    .quote-source {
      font-size: 14px;
      color: rgba(35, 61, 77, 0.7);
      font-style: italic;
    }

    .actions {
      margin-top: 24px;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .btn {
      background: transparent;
      border: 1px solid var(--silent-grove);
      color: var(--silent-grove);
      padding: 8px 18px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .btn:hover { background: var(--silent-grove); color: var(--morning-paper); }

    @media print {
      .actions { display: none !important; }
      body { background: #fff !important; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="quote-mark">“</div>
    <div class="quote-text">“${escapeHtml(quote.quote)}”</div>
    <div class="divider"></div>
    <div class="maker-name">${escapeHtml(quote.maker || 'Unknown')}</div>
    ${quote.about ? `<div class="quote-source">${escapeHtml(quote.about)}${quote.year ? ` (${escapeHtml(quote.year)})` : ''}</div>` : ''}
  </div>

  <div class="actions">
    <button class="btn" onclick="window.print()">🖨️ Print Quote</button>
  </div>
</body>
</html>`;
}
