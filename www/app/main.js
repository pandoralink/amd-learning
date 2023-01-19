define(function (require) {
  var drawDOM = require("draw-dom");
  var utils = require("./utils");

  drawDOM.draw("app", utils.translate("red"));
});
