(function () {
    function showOnLoad() {
        document.querySelectorAll('.reveal').forEach(function (element) {
            element.classList.add('is-visible');
        });
    }

    function observeOnScroll() {
        var elements = document.querySelectorAll('.reveal:not(.is-visible)');

        if (!('IntersectionObserver' in window)) {
            showOnLoad();
            return;
        }

        var observer = new IntersectionObserver(function (entries, currentObserver) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    currentObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        elements.forEach(function (element) {
            observer.observe(element);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeOnScroll);
    } else {
        observeOnScroll();
    }
})();