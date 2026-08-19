(function () {
    var transitionDuration = 1500;
    var transition = document.createElement('div');
    transition.className = 'page-transition';
    transition.innerHTML = '<div class="page-transition-panel"><div class="page-transition-copy"><img class="transition-logo" src="ABS.png" alt="ABS"><span>BUILD. INNOVATE. LEAD.</span></div></div>';
    document.body.appendChild(transition);

    if (sessionStorage.getItem('abs-page-transition') === 'true') {
        sessionStorage.removeItem('abs-page-transition');
        document.body.classList.add('page-arrival');
    }

    document.querySelectorAll('.navbar nav a[href="contact.html"], .navbar nav a[href="index.html"]').forEach(function (link) {
        link.addEventListener('click', function (event) {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                return;
            }

            event.preventDefault();
            sessionStorage.setItem('abs-page-transition', 'true');
            transition.classList.add('is-active');

            window.setTimeout(function () {
                window.location.href = link.href;
            }, transitionDuration * 0.52);
        });
    });
})();