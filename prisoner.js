/**
 * Single prisoner profile page.
 * Reads ?id= from the URL, loads prisoners.json, and renders the match.
 */

(function () {
    "use strict";

    var DATA_URL = "prisoners.json";

    // DOM references
    var loadingEl = document.getElementById("loading");
    var errorEl = document.getElementById("error");
    var errorTextEl = document.getElementById("error-text");
    var prisonerEl = document.getElementById("prisoner");
    var nameEl = document.getElementById("prisoner-name");
    var photoEl = document.getElementById("prisoner-photo");
    var descriptionEl = document.getElementById("prisoner-description");
    var interestsSectionEl = document.getElementById("prisoner-interests");
    var interestsTextEl = document.getElementById("prisoner-interests-text");

    init();

    function init() {
        var prisonerId = getPrisonerIdFromUrl();

        if (!prisonerId) {
            showError("Не указан идентификатор заключённого. Отсканируйте QR-код ещё раз.");
            return;
        }

        loadPrisoners()
            .then(function (data) {
                var prisoner = findPrisonerById(data, prisonerId);

                if (!prisoner) {
                    showError("Заключённый не найден.");
                    return;
                }

                renderPrisoner(prisoner);
            })
            .catch(function () {
                showError("Не удалось загрузить данные. Проверьте подключение к интернету и попробуйте снова.");
            });
    }

    /** Extract prisoner id from ?id= query parameter. */
    function getPrisonerIdFromUrl() {
        var params = new URLSearchParams(window.location.search);
        var id = params.get("id");
        return id ? id.trim() : null;
    }

    /** Fetch prisoners.json from the project root. */
    function loadPrisoners() {
        return fetch(DATA_URL).then(function (response) {
            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }
            return response.json();
        });
    }

    /**
     * Walk the JSON tree and find a prisoner by id.
     * Supports nested categories and flat arrays.
     */
    function findPrisonerById(data, id) {
        var normalizedId = String(id);

        // Flat array of prisoners at the root
        if (Array.isArray(data) && data.length > 0 && data[0].id && !data[0].prisoners) {
            return data.find(function (p) { return String(p.id) === normalizedId; }) || null;
        }

        // Array of categories, each containing a prisoners array
        if (Array.isArray(data)) {
            for (var i = 0; i < data.length; i++) {
                var category = data[i];
                var list = category.prisoners || category.items || [];
                var match = list.find(function (p) { return String(p.id) === normalizedId; });
                if (match) return match;
            }
        }

        return null;
    }

    /**
     * Resolve a field value from alternative key names.
     * Returns null when the value is missing or empty.
     */
    function getField(obj, keys) {
        for (var i = 0; i < keys.length; i++) {
            var value = obj[keys[i]];
            if (value != null && String(value).trim() !== "") {
                return value;
            }
        }
        return null;
    }

    /** Normalize interests to a display string, or null if absent. */
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

    /** Populate the page with prisoner data. */
    function renderPrisoner(prisoner) {
        var fullName = getField(prisoner, ["full_name", "name", "title"]);
        var photo = getField(prisoner, ["photo", "image", "photo_url"]);
        var description = getField(prisoner, ["description", "bio", "about"]);
        var interests = formatInterests(getField(prisoner, ["interests", "topics", "hobbies"]));

        // Update document title and meta description for accessibility / sharing
        if (fullName) {
            document.title = fullName;
            var metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc && description) {
                metaDesc.setAttribute("content", description);
            }
        }

        nameEl.textContent = fullName || "Без имени";

        if (photo) {
            photoEl.src = photo;
            photoEl.alt = fullName
                ? "Фотография: " + fullName
                : "Фотография политического заключённого";
        } else {
            photoEl.removeAttribute("src");
            photoEl.alt = "";
            photoEl.closest(".prisoner__photo-wrapper").hidden = true;
        }

        descriptionEl.textContent = description || "";

        if (interests) {
            interestsTextEl.textContent = interests;
            interestsSectionEl.hidden = false;
        }

        hideLoading();
        prisonerEl.hidden = false;
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
