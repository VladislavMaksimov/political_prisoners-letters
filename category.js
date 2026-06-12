/**
 * Category listing page.
 * Reads ?id= from the URL, loads prisoners.json, and renders prisoner cards.
 */

(function () {
    "use strict";

    var categoryEl = document.getElementById("category");
    var categoryTitleEl = document.getElementById("category-title");
    var cardGridEl = document.getElementById("card-grid");
    var breadcrumbEl = document.getElementById("breadcrumb");

    var status = PageUtils.createStatusController(
        document.getElementById("loading"),
        document.getElementById("error"),
        document.getElementById("error-text")
    );

    init();

    function init() {
        var categoryId = PageUtils.getQueryParam("id");

        if (!categoryId) {
            status.showError("Не указан идентификатор категории. Отсканируйте QR-код ещё раз.");
            return;
        }

        PrisonersApp.loadPrisoners()
            .then(function (data) {
                var category = PrisonersApp.findCategoryById(data, categoryId);

                if (!category) {
                    status.showError("Категория не найдена.");
                    return;
                }

                renderCategory(category);
            })
            .catch(function () {
                status.showError(PageUtils.LOAD_ERROR);
            });
    }

    function renderCategory(category) {
        var categoryName = PrisonersApp.getCategoryName(category);
        var prisoners = PrisonersApp.getPrisonersList(category);

        PageUtils.setDocumentMeta(categoryName, categoryName);

        PageUtils.renderBreadcrumbs(breadcrumbEl, [
            PageUtils.homeBreadcrumbItem(),
            { label: categoryName || "Категория" }
        ]);

        categoryTitleEl.textContent = categoryName || "Категория";
        cardGridEl.innerHTML = "";

        prisoners.forEach(function (prisoner) {
            cardGridEl.appendChild(createPrisonerCard(prisoner));
        });

        status.showContent(categoryEl);
    }

    function createPrisonerCard(prisoner) {
        var fullName = PrisonersApp.getField(prisoner, ["full_name", "name", "title"]);
        var photo = PrisonersApp.getField(prisoner, ["photo", "image", "photo_url"]);
        var interestsPreview = PrisonersApp.previewInterests(
            PrisonersApp.getField(prisoner, ["interests", "topics", "hobbies"])
        );

        var listItem = document.createElement("li");
        listItem.className = "card-grid__item";

        var link = document.createElement("a");
        link.className = "card";
        link.href = PrisonersApp.buildPrisonerUrl(prisoner);
        link.setAttribute("aria-label", fullName || "Профиль заключённого");

        if (!PrisonersApp.getField(prisoner, ["id"])) {
            link.setAttribute("aria-disabled", "true");
        }

        if (photo) {
            var photoWrapper = document.createElement("div");
            photoWrapper.className = "card__photo-wrapper";

            var img = document.createElement("img");
            img.className = "card__photo";
            img.src = photo;
            img.alt = "";
            img.width = 400;
            img.height = 400;
            img.decoding = "async";
            img.loading = "lazy";

            photoWrapper.appendChild(img);
            link.appendChild(photoWrapper);
        }

        var body = document.createElement("div");
        body.className = "card__body";

        var nameEl = document.createElement("h2");
        nameEl.className = "card__name";
        nameEl.textContent = fullName || "Без имени";
        body.appendChild(nameEl);

        if (interestsPreview) {
            var interestsEl = document.createElement("p");
            interestsEl.className = "card__interests";
            interestsEl.textContent = interestsPreview;
            body.appendChild(interestsEl);
        }

        link.appendChild(body);
        listItem.appendChild(link);

        return listItem;
    }
})();
