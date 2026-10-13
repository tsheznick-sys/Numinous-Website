/* Optional progressive enhancement for the standalone landing page. */
(function () {
  'use strict';
  var header = document.querySelector('.site-header');
  function updateHeader() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  document.addEventListener('DOMContentLoaded', function () {
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    document.querySelectorAll('.nav-menu a').forEach(function (link) {
      link.addEventListener('click', function () {
        var menu = link.closest('details');
        if (menu) menu.removeAttribute('open');
      });
    });
  });
}());
