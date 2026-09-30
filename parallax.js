/* Site-wide parallax
   - Page heroes: the photo drifts slower than the page and the text lifts away and fades.
   - Framed photos: each photo glides gently inside its frame as it passes through the screen.
   - Promo banner: the background moves at its own pace.
   Uses the CSS `translate` property so it never fights hover or entrance animations.
   Turns itself off for visitors who ask their device to reduce motion. */
(function () {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;

    var items = [];
    var vh = window.innerHeight;

    function each(selector, fn) {
        Array.prototype.forEach.call(document.querySelectorAll(selector), fn);
    }

    // 1. Heroes
    each('.page-hero', function (hero) {
        var media = hero.querySelector('.page-hero__media');
        var content = hero.querySelector('.page-hero__content');
        var extras = hero.querySelectorAll('.page-hero__trust, .page-hero__stats');
        var inner = hero.querySelector('.page-hero__inner');
        items.push({ type: 'hero', el: hero, media: media, content: content, extras: extras, inner: inner });
    });

    // 2. Photos inside frames (frames already hide overflow)
    var framed = [
        '.ab-split__media img',
        '.ab-person__photo img',
        '.ct-find__photo img',
        '.about-image img',
        '.showroom-image img',
        '.delivery-banner-image img'
    ].join(',');
    each(framed, function (img) {
        img.classList.add('px-framed');
        var frame = img.parentElement;
        if (getComputedStyle(frame).overflow === 'visible') frame.style.overflow = 'hidden';
        var strength = 0.08;
        items.push({ type: 'frame', el: img, frame: frame, strength: strength });
    });

    // 3. Background-image bands
    each('.promo-banner', function (band) {
        var bg = getComputedStyle(band).backgroundImage;
        if (!bg || bg === 'none') return;
        var layer = document.createElement('div');
        layer.className = 'px-bg';
        layer.style.backgroundImage = bg;
        band.classList.add('px-band');
        band.insertBefore(layer, band.firstChild);
        items.push({ type: 'band', el: band, layer: layer });
    });

    if (!items.length) return;

    function update() {
        var y = window.scrollY || window.pageYOffset;
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            var r = (it.frame || it.el).getBoundingClientRect();
            if (r.bottom < -100 || r.top > vh + 100) continue; // off screen

            if (it.type === 'hero') {
                var heroTop = r.top + y;
                var s = Math.max(0, y - heroTop);
                var h = r.height || 1;
                if (it.media) it.media.style.translate = '0 ' + (s * 0.4).toFixed(1) + 'px';
                if (it.content) it.content.style.translate = '0 ' + (s * 0.18).toFixed(1) + 'px';
                if (it.inner) it.inner.style.opacity = Math.max(0, 1 - (s / h) * 1.3).toFixed(3);
                for (var k = 0; k < it.extras.length; k++) {
                    it.extras[k].style.translate = '0 ' + (s * 0.1).toFixed(1) + 'px';
                }
            } else if (it.type === 'frame') {
                // -1 when entering at the bottom, +1 when leaving at the top
                var p = ((vh - r.top) / (vh + r.height)) * 2 - 1;
                it.el.style.translate = '0 ' + (p * r.height * it.strength).toFixed(1) + 'px';
            } else if (it.type === 'band') {
                var q = ((vh - r.top) / (vh + r.height)) * 2 - 1;
                it.layer.style.translate = '0 ' + (q * r.height * 0.18).toFixed(1) + 'px';
            }
        }
        ticking = false;
    }

    var ticking = false;
    function request() {
        if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }

    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', function () { vh = window.innerHeight; request(); });
    reduce.addEventListener && reduce.addEventListener('change', function (e) {
        if (e.matches) window.location.reload();
    });
    update();
})();
