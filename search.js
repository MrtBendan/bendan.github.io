/* 每日分享站 · 搜索：顶栏图标展开输入框，懒加载 /search.json 后本地过滤，结果跳到对应期的日期锚点。 */
(function () {
  var header = document.querySelector(".topbar");
  var box = document.getElementById("searchbox");
  if (!header || !box) return;
  var btn = document.getElementById("searchBtn");
  var input = document.getElementById("searchInput");
  var clearBtn = document.getElementById("searchClear");
  var panel = document.getElementById("searchPanel");
  var meta = document.getElementById("searchMeta");
  var list = document.getElementById("searchResults");
  var empty = document.getElementById("searchEmpty");
  var data = null, loading = false, timer = null;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function highlight(text, q) {
    var i = text.toLowerCase().indexOf(q);
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
  }
  function open() {
    header.classList.add("searching");
    box.classList.add("open");
    input.focus();
    if (input.value.trim()) run();
  }
  function close() {
    header.classList.remove("searching");
    box.classList.remove("open");
    panel.classList.remove("show");
  }
  function ensureData(cb) {
    if (data) { cb(); return; }
    if (loading) { setTimeout(function () { ensureData(cb); }, 150); return; }
    loading = true;
    fetch("/search.json").then(function (r) { return r.json(); }).then(function (j) {
      data = j || []; loading = false; cb();
    }).catch(function () { data = []; loading = false; cb(); });
  }
  function run() {
    var q = input.value.trim().toLowerCase();
    box.classList.toggle("has-text", q.length > 0);
    if (!q) { panel.classList.remove("show"); return; }
    meta.textContent = "正在找…";
    list.innerHTML = ""; empty.style.display = "none";
    panel.classList.add("show");
    ensureData(function () {
      if (input.value.trim().toLowerCase() !== q) return;
      var nameHits = [], descHits = [];
      data.forEach(function (it) {
        if (it.n.toLowerCase().indexOf(q) >= 0) nameHits.push(it);
        else if ((it.d || "").toLowerCase().indexOf(q) >= 0) descHits.push(it);
      });
      var hits = nameHits.concat(descHits).slice(0, 30);
      meta.textContent = hits.length ? "共 " + hits.length + " 条" : "";
      empty.style.display = hits.length ? "none" : "block";
      if (!hits.length) empty.textContent = "没有找到和「" + input.value.trim() + "」相关的分享，换个关键词试试。";
      list.innerHTML = hits.map(function (it) {
        return '<li><a href="/' + it.ym + ".html#" + it.a + '">' +
          '<span class="rname">' + highlight(it.n, q) + "</span>" +
          '<span class="rdesc">' + esc(it.d) + "</span>" +
          '<span class="rdate">' + it.date.slice(5).replace("-", "月") + "日 · 第" + it.i + "期</span></a></li>";
      }).join("");
    });
  }
  btn.addEventListener("click", function () {
    if (box.classList.contains("open")) close(); else open();
  });
  input.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(run, 120);
  });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      var first = list.querySelector("a");
      if (first) first.click();
    } else if (e.key === "Escape") {
      close(); input.blur();
    }
  });
  clearBtn.addEventListener("click", function () {
    input.value = ""; box.classList.remove("has-text");
    panel.classList.remove("show"); input.focus();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
      e.preventDefault(); open();
    }
  });
  document.addEventListener("click", function (e) {
    if (box.classList.contains("open") && !header.contains(e.target)) close();
  });
})();
