define(function (require) {
  const drawDOM = require("draw-dom");
  const utils = require("./utils");

  drawDOM.draw("app", utils.translate("red"));
});
