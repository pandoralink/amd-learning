define("draw-dom", ["exports"], function (exports) {
  exports.draw = function (id, color) {
    document.querySelector(String("#" + id)).style.color = color;
  };
});
