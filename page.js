/**
 * Shared page utilities: URL params, status UI, document meta.
 */
var PageUtils = (function () {
    "use strict";

    var LOAD_ERROR =
        "Не удалось загрузить данные. Проверьте подключение к интернету и попробуйте снова.";

    var HOME_LABEL = "Главная";

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

    /**
     * Render an accessible breadcrumb trail.
     * Each item: { label, href? } — the last item is the current page.
     */
    function renderBreadcrumbs(container, items) {
        if (!container || !items || items.length === 0) return;

        container.innerHTML = "";

        var nav = document.createElement("nav");
        nav.className = "breadcrumb";
        nav.setAttribute("aria-label", "Навигация");

        var list = document.createElement("ol");
        list.className = "breadcrumb__list";

        items.forEach(function (item, index) {
            var li = document.createElement("li");
            li.className = "breadcrumb__item";

            var isLast = index === items.length - 1;

            if (isLast || !item.href) {
                li.textContent = item.label;
                li.setAttribute("aria-current", "page");
            } else {
                var link = document.createElement("a");
                link.className = "breadcrumb__link";
                link.href = item.href;
                link.textContent = item.label;
                li.appendChild(link);
            }

            list.appendChild(li);
        });

        nav.appendChild(list);
        container.appendChild(nav);
    }

    /** Standard breadcrumb starting with the homepage link. */
    function homeBreadcrumbItem() {
        return {
            label: HOME_LABEL,
            href: PrisonersApp.PAGES.home
        };
    }

    return {
        LOAD_ERROR: LOAD_ERROR,
        HOME_LABEL: HOME_LABEL,
        getQueryParam: getQueryParam,
        setDocumentMeta: setDocumentMeta,
        createStatusController: createStatusController,
        renderBreadcrumbs: renderBreadcrumbs,
        homeBreadcrumbItem: homeBreadcrumbItem
    };
})();
