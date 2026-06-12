/**
 * Category listing page.
 * Reads ?id= from the URL, loads prisoners.json, and renders prisoner cards.
 */

(function () {
    "use strict";

    var DATA_URL = "prisoners.json";
    var PRISONER_PAGE = "prisoner.html";
    var INTERESTS_PREVIEW_MAX = 72;

    var loadingEl = document.getElementById("loading");
    var errorEl = document.getElementById("error");
    var errorTextEl = document.getElementById("error-text");
    var categoryEl = document.getElementById("category");
    var categoryTitleEl = document.getElementById("category-title");
    var cardGridEl = document.getElementById("card-grid");

    init();

    function init() {
        var categoryId = getCategoryIdFromUrl();

        if (!categoryId) {
            showError("Не указан идентификатор категории. Отсканируйте QR-код ещё раз.");
            return;
        }

        loadPrisoners()
            .then(function (data) {
                var category = findCategoryById(data, categoryId);

                if (!category) {
                    showError("Категория не найдена.");
                    return;
                }

                renderCategory(category);
            })
            .catch(function () {
                showError("Не удалось загрузить данные. Проверьте подключение к интернету и попробуйте снова.");
            });
    }

    /** Extract category id from ?id= query parameter. */
    function getCategoryIdFromUrl() {
        var params = new URLSearchParams(window.location.search);
        var id = params.get("id");
        return id ? id.trim() : null;
    }

    function loadPrisoners() {
        return fetch(DATA_URL).then(function (response) {
            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }
            return response.json();
        });
    }

    /**
     * Find a category by id, name, slug, or numeric index.
     * Handles flexible JSON key names.
     */
    function findCategoryById(data, id) {
        if (!Array.isArray(data)) return null;

        var normalizedId = String(id);

        // Numeric index fallback (e.g. ?id=0)
        if (/^\d+$/.test(normalizedId)) {
            var index = parseInt(normalizedId, 10);
            if (index >= 0 && index < data.length) {
                return data[index];
            }
        }

        for (var i = 0; i < data.length; i++) {
            var category = data[i];
            var categoryId = getField(category, ["id", "category_id", "slug"]);
            var categoryName = getCategoryName(category);

            if (categoryId && String(categoryId) === normalizedId) {
                return category;
            }

            if (categoryName && categoryName === decodeURIComponent(normalizedId)) {
                return category;
            }
        }

        return null;
    }

    function getCategoryName(category) {
        return getField(category, ["category_name", "name", "title"]);
    }

    function getPrisonersList(category) {
        return category.prisoners || category.items || [];
    }

    function getField(obj, keys) {
        for (var i = 0; i < keys.length; i++) {
            var value = obj[keys[i]];
            if (value != null && String(value).trim() !== "") {
                return value;
            }
        }
        return null;
    }

    function formatInterests(interests) {
        if (interests == null) return null;

        if (Array.isArray(interests)) {
            var filtered = interests
                .map(function (item) { return String(item).trim(); })
                .filter(Boolean);
            return filtered.length > 0 ? filtered.join(", ") : null;
        }

        var text = String(interests).trim();
        return text || null;
    }

    /** Truncate interests for card preview. */
    function previewInterests(interests) {
        var text = formatInterests(interests);
        if (!text) return null;

        if (text.length <= INTERESTS_PREVIEW_MAX) {
            return text;
        }

        var truncated = text.slice(0, INTERESTS_PREVIEW_MAX);
        var lastComma = truncated.lastIndexOf(", ");

        if (lastComma > INTERESTS_PREVIEW_MAX * 0.5) {
            truncated = truncated.slice(0, lastComma);
        }

        return truncated + "…";
    }

    function renderCategory(category) {
        var categoryName = getCategoryName(category);
        var prisoners = getPrisonersList(category);

        if (categoryName) {
            document.title = categoryName;
            var metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute("content", categoryName);
            }
        }

        categoryTitleEl.textContent = categoryName || "Категория";
        cardGridEl.innerHTML = "";

        prisoners.forEach(function (prisoner) {
            cardGridEl.appendChild(createCard(prisoner));
        });

        hideLoading();
        categoryEl.hidden = false;
    }

    function createCard(prisoner) {
        var prisonerId = getField(prisoner, ["id"]);
        var fullName = getField(prisoner, ["full_name", "name", "title"]);
        var photo = getField(prisoner, ["photo", "image", "photo_url"]);
        var interestsPreview = previewInterests(
            getField(prisoner, ["interests", "topics", "hobbies"])
        );

        var listItem = document.createElement("li");
        listItem.className = "card-grid__item";

        var link = document.createElement("a");
        link.className = "card";

        if (prisonerId) {
            link.href = PRISONER_PAGE + "?id=" + encodeURIComponent(prisonerId);
        } else {
            link.href = "#";
            link.setAttribute("aria-disabled", "true");
        }

        link.setAttribute("aria-label", fullName || "Профиль заключённого");

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

    function hideLoading() {
        loadingEl.hidden = true;
    }

    function showError(message) {
        hideLoading();
        errorTextEl.textContent = message;
        errorEl.hidden = false;
    }
})();
