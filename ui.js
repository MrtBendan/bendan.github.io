/* 每日分享站 · 轻交互：区块入场（淡入上移）+ 期页日期芯片滚动侦测高亮。遵循减动效偏好。 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var els = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(function (e) { e.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -3% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }
  var chips = {};
  document.querySelectorAll(".dayindex a").forEach(function (a) {
    chips[a.getAttribute("href").slice(1)] = a;
  });
  var days = document.querySelectorAll(".day[id]");
  if (days.length && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          Object.keys(chips).forEach(function (k) { chips[k].classList.remove("on"); });
          var c = chips[en.target.id];
          if (c) c.classList.add("on");
        }
      });
    }, { rootMargin: "-18% 0px -72% 0px" });
    days.forEach(function (d) { so.observe(d); });
  }
})();
