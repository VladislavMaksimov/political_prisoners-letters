/**
 * Shared page utilities: URL params, status UI, document meta.
 */
var PageUtils = (function () {
    "use strict";

    var LOAD_ERROR =
        "Не удалось загрузить данные. Проверьте подключение к интернету и попробуйте снова.";

    /** Read a trimmed query parameter from the current URL. */
    function getQueryParam(name) {
        var params = new URLSearchParams(window.location.search);
        var value = params.get(name);
        return value ? value.trim() : null;
    }

    /** Update document title and meta description. */
    function setDocumentMeta(title, description) {
        if (title) {
            document.title = title;
        }

        if (description) {
            var metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute("content", description);
            }
        }
    }

    /**
     * Create helpers for the standard loading / error UI
     * used across all pages.
     */
    function createStatusController(loadingEl, errorEl, errorTextEl) {
        return {
            hideLoading: function () {
                loadingEl.hidden = true;
            },

            showError: function (message) {
                loadingEl.hidden = true;
                errorTextEl.textContent = message;
                errorEl.hidden = false;
            },

            showContent: function (contentEl) {
                loadingEl.hidden = true;
                contentEl.hidden = false;
            }
        };
    }

    return {
        LOAD_ERROR: LOAD_ERROR,
        getQueryParam: getQueryParam,
        setDocumentMeta: setDocumentMeta,
        createStatusController: createStatusController
    };
})();
