window.onload = function() {
  let main = new Main()
}

class Main {
  constructor() {
    this.init()
  }

  init() {
    this.mainCanvas = document.getElementById("main-canvas");
    this.mainCtx = this.mainCanvas.getContext("2d");
    this.mainCanvas.width  = 100;
    this.mainCanvas.height = 100;
    this.mainCanvas.style.border = "4px solid #F00";
  }
}
