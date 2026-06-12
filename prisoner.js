/**
 * Single prisoner profile page.
 * Reads ?id= from the URL, loads prisoners.json, and renders the match.
 */

(function () {
    "use strict";

    var prisonerEl = document.getElementById("prisoner");
    var nameEl = document.getElementById("prisoner-name");
    var photoEl = document.getElementById("prisoner-photo");
    var descriptionEl = document.getElementById("prisoner-description");
    var interestsSectionEl = document.getElementById("prisoner-interests");
    var interestsTextEl = document.getElementById("prisoner-interests-text");

    var status = PageUtils.createStatusController(
        document.getElementById("loading"),
        document.getElementById("error"),
        document.getElementById("error-text")
    );

    init();

    function init() {
        var prisonerId = PageUtils.getQueryParam("id");

        if (!prisonerId) {
            status.showError("Не указан идентификатор заключённого. Отсканируйте QR-код ещё раз.");
            return;
        }

        PrisonersApp.loadPrisoners()
            .then(function (data) {
                var prisoner = PrisonersApp.findPrisonerById(data, prisonerId);

                if (!prisoner) {
                    status.showError("Заключённый не найден.");
                    return;
                }

                renderPrisoner(prisoner);
            })
            .catch(function () {
                status.showError(PageUtils.LOAD_ERROR);
            });
    }

    function renderPrisoner(prisoner) {
        var fullName = PrisonersApp.getField(prisoner, ["full_name", "name", "title"]);
        var photo = PrisonersApp.getField(prisoner, ["photo", "image", "photo_url"]);
        var description = PrisonersApp.getField(prisoner, ["description", "bio", "about"]);
        var interests = PrisonersApp.formatInterests(
            PrisonersApp.getField(prisoner, ["interests", "topics", "hobbies"])
        );

        PageUtils.setDocumentMeta(fullName, description);

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

        status.showContent(prisonerEl);
    }
})();
