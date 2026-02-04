/**
 * Simple State Management for Manual App
 * Manages isBeginner and fudeKaisu state variables
 */
(function () {
  "use strict";

  // State variables
  let isBeginner = false;
  let fudeKaisu = null; // 1, 2, or 3

  // cb-fude-hanbaiten-modoshi-alert
  const hanbaitenModoshiAlert = document.querySelector(
    '.alert[data-show-if="isBeginner && fudeKaisu === 3"]'
  );

  console.log("[State] hanbaitenModoshiAlert element:", hanbaitenModoshiAlert);

  // Update UI based on state
  function updateUI() {
    console.log("[State] updateUI called:", { isBeginner, fudeKaisu });

    // Show alert only when isBeginner is true AND fudeKaisu is 3
    if (hanbaitenModoshiAlert) {
      const shouldShow = isBeginner && fudeKaisu === 3;
      hanbaitenModoshiAlert.style.display = shouldShow ? "" : "none";
      console.log(
        "[State] Alert display:",
        shouldShow ? "visible" : "hidden"
      );
    } else {
      console.warn("[State] beginnerAlert element not found!");
    }
  }

  // Beginner checkbox handler
  const beginnerCheckbox = document.getElementById("is-begginer-checkbox");
  console.log("[State] beginnerCheckbox element:", beginnerCheckbox);

  if (beginnerCheckbox) {
    beginnerCheckbox.addEventListener("change", (e) => {
      isBeginner = e.target.checked;
      console.log("[State] Beginner checkbox changed:", isBeginner);
      updateUI();
    });
  } else {
    console.error("[State] is-begginer-checkbox not found!");
  }

  // Fude-kaisu radio button handlers
  const fudeKaisuRadios = document.querySelectorAll('input[name="fude-kaisu"]');
  console.log("[State] fude-kaisu radio buttons found:", fudeKaisuRadios.length);

  fudeKaisuRadios.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (e.target.checked) {
        // Extract number: "1回目" -> 1, "2回目" -> 2, "3回目" -> 3
        const match = e.target.value.match(/(\d+)回目/);
        fudeKaisu = match ? parseInt(match[1], 10) : null;
        console.log(
          "[State] Fude-kaisu changed:",
          fudeKaisu,
          "from value:",
          e.target.value
        );
        updateUI();
      }
    });
  });

  // Initial UI update
  updateUI();

  // Expose state for debugging (optional)
  window.__manualState = {
    get isBeginner() {
      return isBeginner;
    },
    get fudeKaisu() {
      return fudeKaisu;
    },
  };
})();
