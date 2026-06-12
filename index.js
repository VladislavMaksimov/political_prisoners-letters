/**
 * Homepage — lists all prisoner categories from prisoners.json.
 */

(function () {
    "use strict";

    var loadingEl = document.getElementById("loading");
    var errorEl = document.getElementById("error");
    var errorTextEl = document.getElementById("error-text");
    var homeEl = document.getElementById("home");
    var categoryGridEl = document.getElementById("category-grid");

    var status = PageUtils.createStatusController(loadingEl, errorEl, errorTextEl);

    init();

    function init() {
        PrisonersApp.loadPrisoners()
            .then(function (data) {
                renderHome(PrisonersApp.getCategories(data));
            })
            .catch(function () {
                status.showError(PageUtils.LOAD_ERROR);
            });
    }

    function renderHome(categories) {
        categoryGridEl.innerHTML = "";

        categories.forEach(function (category, index) {
            categoryGridEl.appendChild(createCategoryCard(category, index));
        });

        status.showContent(homeEl);
    }

    function createCategoryCard(category, index) {
        var categoryName = PrisonersApp.getCategoryName(category);
        var prisonerCount = PrisonersApp.getPrisonersList(category).length;
        var categoryUrl = PrisonersApp.buildCategoryUrl(category, index);

        var listItem = document.createElement("li");
        listItem.className = "card-grid__item";

        var link = document.createElement("a");
        link.className = "card card--category";
        link.href = categoryUrl;
        link.setAttribute(
            "aria-label",
            (categoryName || "Категория") + ": " +
            PrisonersApp.formatPrisonerCount(prisonerCount)
        );

        var body = document.createElement("div");
        body.className = "card__body";

        var titleEl = document.createElement("h2");
        titleEl.className = "card__name";
        titleEl.textContent = categoryName || "Категория";
        body.appendChild(titleEl);

        var countEl = document.createElement("p");
        countEl.className = "card__count";
        countEl.textContent = PrisonersApp.formatPrisonerCount(prisonerCount);
        body.appendChild(countEl);

        link.appendChild(body);
        listItem.appendChild(link);

        return listItem;
    }
})();
