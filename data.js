/**
 * Shared data helpers for loading and parsing prisoners.json.
 */
var PrisonersApp = (function () {
    "use strict";

    var DATA_URL = "prisoners.json";

    var PAGES = {
        home: "index.html",
        category: "category.html",
        prisoner: "prisoner.html"
    };

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

    function getCategoryName(category) {
        return getField(category, ["category_name", "name", "title"]);
    }

    function getPrisonersList(category) {
        return category.prisoners || category.items || [];
    }

    /** Return top-level categories from the JSON structure. */
    function getCategories(data) {
        if (!Array.isArray(data)) return [];
        return data;
    }

    /** Resolve a category id for URL links; falls back to array index. */
    function getCategoryLinkId(category, index) {
        var id = getField(category, ["id", "category_id", "slug"]);
        return id != null ? String(id) : String(index);
    }

    function buildCategoryUrl(category, index) {
        var id = getCategoryLinkId(category, index);
        return PAGES.category + "?id=" + encodeURIComponent(id);
    }

    function buildPrisonerUrl(prisoner) {
        var id = getField(prisoner, ["id"]);
        if (!id) return "#";
        return PAGES.prisoner + "?id=" + encodeURIComponent(id);
    }

    /**
     * Find a category by id, name, slug, or numeric index.
     */
    function findCategoryById(data, id) {
        var categories = getCategories(data);
        if (categories.length === 0) return null;

        var normalizedId = String(id);

        if (/^\d+$/.test(normalizedId)) {
            var index = parseInt(normalizedId, 10);
            if (index >= 0 && index < categories.length) {
                return categories[index];
            }
        }

        for (var i = 0; i < categories.length; i++) {
            var category = categories[i];
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

    /**
     * Walk the JSON tree and find a prisoner by id.
     * Supports nested categories and flat arrays.
     */
    function findPrisonerById(data, id) {
        var normalizedId = String(id);

        if (Array.isArray(data) && data.length > 0 && data[0].id && !data[0].prisoners) {
            return data.find(function (p) { return String(p.id) === normalizedId; }) || null;
        }

        if (Array.isArray(data)) {
            for (var i = 0; i < data.length; i++) {
                var list = getPrisonersList(data[i]);
                var match = list.find(function (p) { return String(p.id) === normalizedId; });
                if (match) return match;
            }
        }

        return null;
    }

    /**
     * Find a prisoner and the category it belongs to.
     * Returns { category, categoryIndex, prisoner } or null.
     */
    function findPrisonerContext(data, prisonerId) {
        var normalizedId = String(prisonerId);
        var categories = getCategories(data);

        for (var i = 0; i < categories.length; i++) {
            var category = categories[i];
            var list = getPrisonersList(category);
            var prisoner = list.find(function (p) { return String(p.id) === normalizedId; });

            if (prisoner) {
                return {
                    category: category,
                    categoryIndex: i,
                    prisoner: prisoner
                };
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

    /** Truncate interests for card preview. */
    function previewInterests(interests, maxLength) {
        var limit = maxLength || 72;
        var text = formatInterests(interests);
        if (!text) return null;

        if (text.length <= limit) {
            return text;
        }

        var truncated = text.slice(0, limit);
        var lastComma = truncated.lastIndexOf(", ");

        if (lastComma > limit * 0.5) {
            truncated = truncated.slice(0, lastComma);
        }

        return truncated + "…";
    }

    /** Russian plural form for prisoner count labels. */
    function formatPrisonerCount(count) {
        var n = Math.abs(count) % 100;
        var n1 = n % 10;
        var word;

        if (n > 10 && n < 20) {
            word = "заключённых";
        } else if (n1 === 1) {
            word = "заключённый";
        } else if (n1 >= 2 && n1 <= 4) {
            word = "заключённых";
        } else {
            word = "заключённых";
        }

        return count + " " + word;
    }

    return {
        PAGES: PAGES,
        loadPrisoners: loadPrisoners,
        getField: getField,
        getCategoryName: getCategoryName,
        getPrisonersList: getPrisonersList,
        getCategories: getCategories,
        getCategoryLinkId: getCategoryLinkId,
        buildCategoryUrl: buildCategoryUrl,
        buildPrisonerUrl: buildPrisonerUrl,
        findCategoryById: findCategoryById,
        findPrisonerById: findPrisonerById,
        findPrisonerContext: findPrisonerContext,
        formatInterests: formatInterests,
        previewInterests: previewInterests,
        formatPrisonerCount: formatPrisonerCount
    };
})();
