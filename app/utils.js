define(function () {
  return {
    translate: function (name) {
      let color = "";
      switch (name) {
        case "red":
          color = "#FF0000";
          break;
        default:
          color = "#000000";
      }
      return color;
    },
  };
});
