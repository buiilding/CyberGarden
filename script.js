const pages = {
  untitled: {title: 'An untitled page', related: 'note'},
  note: {title: 'A small note', related: 'untitled'},
  link: {title: 'A saved link', related: 'image'},
  image: {title: 'A sample image', related: 'unfinished'},
  unfinished: {title: 'An unfinished page', related: 'untitled'}
};
function route(focus = false) {
  const hash = location.hash;
  if (hash === '#main') return;
  const id = hash.startsWith('#page/') ? hash.slice(6) : null;
  const page = pages[id];
  const view = page ? 'page' : hash === '#pages' ? 'pages' : 'home';
  document.querySelectorAll('.view').forEach(section => {section.hidden = section.id !== `${view}-view`;});
  document.querySelectorAll('[data-page]').forEach(link => {
    if (link.dataset.page === (page ? id : view)) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (page) {
    document.querySelector('#page-title').textContent = page.title;
    document.querySelector('#page-content').replaceChildren(document.querySelector(`#${id}-content`).content.cloneNode(true));
    const related = document.querySelector('#related-page');
    related.textContent = pages[page.related].title;
    related.href = `#page/${page.related}`;
  }
  document.title = `${page ? page.title : view === 'pages' ? 'All Pages' : 'Home'} — Peter`;
  if (focus) {
    window.scrollTo({top: 0, behavior: 'instant'});
    document.querySelector('#main').focus({preventScroll: true});
  }
}
window.addEventListener('hashchange', () => route(true));
route();
