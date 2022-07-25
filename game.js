const V_LEN = 12;
const H_LEN = 10;
const HEADER_SIZE = 40;
const FOOTER_SIZE = 40;
const BLOCK_SIZE = -3 + Math.floor(((window.innerHeight-HEADER_SIZE-FOOTER_SIZE)/V_LEN < window.innerWidth/H_LEN) ? (window.innerHeight-HEADER_SIZE-FOOTER_SIZE)/V_LEN : window.innerWidth/H_LEN);

const EMPTY = 0;
const WALL  = 1;

const shape = [
  [ [0,1],
    [1,1],
  ],
  [ [1,0],
    [1,1],
  ],
  [ [1,1],
    [0,1],
  ],
  [ [1,1],
    [1,0],
  ]
];

const color_list = [
  "#DDD",
  "#000",
  "#F00",
  "#0B0",
  "#44F",
  "#808"
];

function handle(event) {
    event.preventDefault();
}

window.onload = function() {
  //document.documentElement.requestFullscreen();
  document.addEventListener("mousewheel", handle, { passive: false });
  document.addEventListener("touchmove", handle, { passive: false });
  let main = new Main();
  document.onkeydown = function(e){main.onkeydown(e.key)};
  setInterval(function(){main.interval()}, 1000);
  main.canvas.addEventListener('mousedown', function(e){main.touch(e)});
}

class State {
  constructor() {
    this.board = new Array(V_LEN);
    for (let v=0; v<V_LEN; v++) {
      this.board[v] = new Array(H_LEN);
      for (let h=0; h<H_LEN; h++) {
        this.board[v][h] = EMPTY;
        if (v == 0)       this.board[v][h] = WALL;
        if (h == 0)       this.board[v][h] = WALL;
        if (v == V_LEN-1) this.board[v][h] = WALL;
        if (h == H_LEN-1) this.board[v][h] = WALL;
      }
    }

    this.y = 1;
    this.x = V_LEN/2-2;
    this.id = 0;
    this.score = 1;
    this.prev_score = 0;
    this.high_score = 0;
  }
}

class Main {
  constructor() {
    this.init();
    this.draw_all();
  }

  init() {
    this.canvas = document.getElementById("main-canvas");
    this.canvas.width  = BLOCK_SIZE*H_LEN;
    this.canvas.height = BLOCK_SIZE*V_LEN + HEADER_SIZE + FOOTER_SIZE;
    this.ctx = this.canvas.getContext("2d");
    this.state = new State();
  }

  onkeydown(e) {
    switch (e) {
      case "ArrowLeft":
      case "z":
        this.state = key_left(this.state);
        break;

      case "ArrowRight":
      case "c":
        this.state = key_right(this.state);
        break;

      case "ArrowDown":
      case "x":
        this.state = key_down(this.state);
        break;

      case " ":               
        this.state = key_space(this.state);
        break;
    }
    this.draw_all();
  }

  touch(e) {
    let y = e.clientY;
    let x = e.clientX;
    let label = "";
    if      (x < BLOCK_SIZE*3)         label = "ArrowLeft";
    else if (x > BLOCK_SIZE*(H_LEN-3)) label = "ArrowRight";
    else if (y > BLOCK_SIZE*(V_LEN-3)) label = "ArrowDown";
    this.onkeydown(label);
  };

  interval() {
    this.state = key_down(this.state);
    this.draw_all();
  }

  draw_block(y,x,color) {
    let py = y * BLOCK_SIZE + HEADER_SIZE;
    let px = x * BLOCK_SIZE;
    this.ctx.fillStyle = color_list[color];
    this.ctx.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
  }

  draw_board() {
    for (let v=0; v<V_LEN; v++) {
      for (let h=0; h<H_LEN; h++) {
        this.draw_block(v, h, this.state.board[v][h]);
      }
    }

    for (let i=0; i<2; i++) {
      for (let j=0; j<2; j++) {
        if (shape[this.state.id][i][j] == 1) {
          let v = this.state.y + i;
          let h = this.state.x + j;
          this.draw_block(v, h, this.state.id + 2);
        }
      }
    }
  }

  draw_all() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#FFF";
    this.ctx.fillRect(0, 0, this.canvas.width, HEADER_SIZE);

    this.ctx.font = '20px bold';
    this.ctx.fillStyle = "#000";
    this.ctx.fillText("SCORE:" + this.state.score, BLOCK_SIZE, HEADER_SIZE/2);
    this.ctx.fillText("PREV:"  + this.state.prev_score, BLOCK_SIZE*4, HEADER_SIZE/2);
    this.ctx.fillText("HIGH:"  + this.state.high_score, BLOCK_SIZE*7, HEADER_SIZE/2);
    this.draw_board();

    this.ctx.fillStyle = "#FFF";
    this.ctx.fillRect(0, HEADER_SIZE+BLOCK_SIZE*V_LEN, this.canvas.width, FOOTER_SIZE);
  }
}

function key_down(state) {
  if (is_hit(state, state.y+1, state.x)) {
    state = insert_mino_to_board(state);
    state = remove_completed_lines(state);
    state = prepare_new_mino(state);
  }
  else state.y = state.y+1;
  return state;
}

function key_left(state) {
  if (is_hit(state, state.y, state.x-1) == 0) {
    state.x = state.x-1;
  }
  return state;
}

function key_right(state) {
  if (is_hit(state, state.y, state.x+1) == 0) {
    state.x = state.x+1;
  }
  return state;
}

function key_space(state) {
  while (!is_hit(state, state.y+1, state.x)) state.y++;
  return state;
}

function is_hit(state, y, x) {
  for (let i=0; i<2; i++) {
    for (let j=0; j<2; j++) {
      if (shape[state.id][i][j] == 0) continue;
      if (state.board[y+i][x+j] == EMPTY) continue;
      return true;
    }
  }
  return false;
}

function insert_mino_to_board(state) {
  for (let i=0; i<2; i++) {
    for (let j=0; j<2; j++) {
      if (shape[state.id][i][j] == 1) {
        let v = state.y + i;
        let h = state.x + j;
        state.board[v][h] = state.id + 2;
      }
    }
  }
  return state;
}

function remove_completed_lines(state) {
  for (let v=V_LEN-2; v>=1; v--) {
    let is_delete = true;
    for (let h=0; h<H_LEN; h++) {
      if (state.board[v][h] == EMPTY) {
        is_delete = false;
        break;
      }
    }

    if (is_delete) {
      state.score++;
      for (let tmp_v=v; tmp_v>=2; tmp_v--) {
        for (let h=0; h<H_LEN; h++) {
          state.board[tmp_v][h] = state.board[tmp_v-1][h];
        }
      }
      for (let h=1; h<H_LEN-1; h++) {
        state.board[1][h] = EMPTY;
      }

      v++;
    }
  }
  return state;
}

function prepare_new_mino(state) {
  state.y  = 1;
  state.x  = V_LEN/2-2;
  state.id = Math.floor(Math.random() * 4);
  state.score++;

  if (is_hit(state, state.y, state.x)) {
    if (state.score > state.high_score) state.high_score = state.score;
    state.prev_score = state.score;
    state.score = 1;

    for (let v=1; v<V_LEN-1; v++) {
      for (let h=1; h<H_LEN-1; h++) {
        state.board[v][h] = EMPTY;
      }
    }
  }
  return state;
}
