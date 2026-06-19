(function() {
    var navButton = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");

    if (navButton && nav) {
        navButton.addEventListener("click", function() {
            var isOpen = nav.classList.toggle("is-open");
            navButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    var backTop = document.createElement("button");
    backTop.className = "back-top";
    backTop.type = "button";
    backTop.textContent = "↑";
    document.body.appendChild(backTop);

    window.addEventListener("scroll", function() {
        if (window.scrollY > 420) {
            backTop.classList.add("is-visible");
        } else {
            backTop.classList.remove("is-visible");
        }
    });

    backTop.addEventListener("click", function() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    var hero = document.querySelector(".js-hero-carousel");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll(".hero-thumb"));
        var bg = hero.querySelector(".hero-bg");
        var panelPoster = hero.querySelector(".js-hero-poster");
        var panelTitle = hero.querySelector(".js-hero-title");
        var panelText = hero.querySelector(".js-hero-text");
        var panelLink = hero.querySelector(".js-hero-link");
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            var slide = slides[current];

            slides.forEach(function(item, idx) {
                item.hidden = idx !== current;
                item.classList.toggle("is-active", idx === current);
            });

            thumbs.forEach(function(item, idx) {
                item.classList.toggle("is-active", idx === current);
            });

            var image = slide.getAttribute("data-bg") || "";
            var title = slide.getAttribute("data-title") || "";
            var text = slide.getAttribute("data-text") || "";
            var href = slide.getAttribute("data-href") || "#";

            if (bg) {
                bg.style.backgroundImage = "linear-gradient(180deg, rgba(15, 23, 42, 0.10), rgba(15, 23, 42, 0.90)), url('" + image + "')";
            }

            if (panelPoster) {
                panelPoster.style.backgroundImage = "linear-gradient(180deg, rgba(15, 23, 42, 0.04), rgba(15, 23, 42, 0.55)), url('" + image + "')";
            }

            if (panelTitle) {
                panelTitle.textContent = title;
            }

            if (panelText) {
                panelText.textContent = text;
            }

            if (panelLink) {
                panelLink.setAttribute("href", href);
            }
        }

        thumbs.forEach(function(button, index) {
            button.addEventListener("click", function() {
                showSlide(index);
            });
        });

        showSlide(0);

        window.setInterval(function() {
            showSlide(current + 1);
        }, 5200);
    }

    var filterBars = Array.prototype.slice.call(document.querySelectorAll(".js-filter-bar"));

    filterBars.forEach(function(bar) {
        var scopeSelector = bar.getAttribute("data-scope") || "body";
        var scope = document.querySelector(scopeSelector) || document;
        var input = bar.querySelector(".js-search-input");
        var selects = Array.prototype.slice.call(bar.querySelectorAll("select"));
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".js-filter-card"));
        var empty = document.querySelector(bar.getAttribute("data-empty") || "");

        function runFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var values = {};
            selects.forEach(function(select) {
                values[select.name] = select.value;
            });

            var visible = 0;

            cards.forEach(function(card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchYear = !values.year || card.getAttribute("data-year") === values.year;
                var matchType = !values.type || card.getAttribute("data-type") === values.type;
                var matchRegion = !values.region || card.getAttribute("data-region") === values.region;
                var matchCategory = !values.category || card.getAttribute("data-category") === values.category;
                var ok = matchKeyword && matchYear && matchType && matchRegion && matchCategory;

                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        if (input) {
            input.addEventListener("input", runFilter);
        }

        selects.forEach(function(select) {
            select.addEventListener("change", runFilter);
        });

        runFilter();
    });
})();
