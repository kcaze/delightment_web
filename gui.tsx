import * as React from 'react';
import ReactDOM from 'react-dom';
import {generateDefaultState, clone, drawState} from './main';
import {play} from './play';
import lzstring from 'lz-string';

let editorState = null;
let undoStack = [];

function deleteTile(tiles, cursor) {
  const tile = tiles[cursor.z][cursor.y][cursor.x];
  tiles[cursor.z][cursor.y][cursor.x] = null;
  if (tile && tile.color == 'S') {
    if (tile.direction == 'U') {
      tiles[cursor.z+1][cursor.y][cursor.x] = null;
    } else {
      tiles[cursor.z-1][cursor.y][cursor.x] = null;
    }
  }
}

function replay(stack) {
  let state = clone(editorState);
  for (const action of stack) {
    if (action == 'reset') state = clone(editorState);
    else state = play(state, action);
  }
  state.mode = 'play';
  return state;
}

function didWin(state) {
  for (const plane of state.tiles) {
    for (const row of plane) {
      for (const tile of row) {
        if (tile && tile.color == 'W' && !tile.on) return false;
      }
    }
  }
  return true;
}

class EditorGui extends React.Component {
  constructor() {
    try {
      this.state = JSON.parse(lzstring.decompressFromBase64(location.hash.slice(1)));
      undoStack = this.state.undoStack;
      editorState = this.state.editorState;
      delete this.state.editorState;
      delete this.state.undoStack;
      console.log(editorState);
    } catch (e) {
      this.state = generateDefaultState();
      editorState = clone(this.state);
    }
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentDidMount() {
    this.updateCanvas(); 
  }

  componentDidUpdate() {
    this.updateCanvas(); 
    if (this.state.mode == 'edit') {
      editorState = clone(this.state);
      undoStack = [];
    } else {
      if (didWin(this.state)) {
        window.alert('You solved it!');
      }
    }
    const encodedState = lzstring.compressToBase64(JSON.stringify({...this.state, undoStack, editorState}));
    parent.location.hash = encodedState;
  }

  updateCanvas() {
    drawState(this.refs.canvas, this.state);
  }

  onKeyDown = (e) => {
    if (e.code == 'Tab' && !e.ctrlKey && !e.shiftKey) {
      this.switchMode();
      e.preventDefault();
    } else {
      if (this.state.mode == 'edit') {
        if (this.onEditKeyDown(e)) e.preventDefault();
      } else {
        if (this.onPlayKeyDown(e)) e.preventDefault();
      }
    }
  };

  onPlayKeyDown = (e) => {
    let action;
    if (e.code == 'Space') {
      action = 'act';
    } else if (e.code == 'ArrowRight') {
      action = 'right';
    } else if (e.code == 'ArrowLeft') {
      action = 'left';
    } else if (e.code == 'ArrowDown') {
      action = 'down';
    } else if (e.code == 'ArrowUp') {
      action = 'up';
    } else if (e.code == 'KeyR') {
      const newState = clone(editorState);
      newState.mode = 'play';
      if (JSON.stringify(newState) !== JSON.stringify(this.state)) {
        undoStack.push('reset'); 
      }
      this.setState(newState);
      return true;
    } else if (e.code == 'KeyZ') {
      undoStack.pop();
      this.setState(replay(undoStack));
      return true;
    } else {
      return false;
    }
    const newState = play(this.state, action);
    if (JSON.stringify(newState) !== JSON.stringify(this.state)) {
      undoStack.push(action);
    }
    this.setState(newState);
    return true;
  }

  onEditKeyDown = (e) => {
    const {cursor} = this.state;
    if (e.code == 'ArrowLeft') {
      if (e.ctrlKey) {
        const tiles = clone(this.state.tiles);
        const tile = tiles[cursor.z][cursor.y][cursor.x];
        if (tile != null && tile.color == 'G')
          tile.direction = 'L';
        if (tile != null && tile.color == 'Y')
          tile.charge = '-';
        if (tile != null && tile.color == 'W')
          tile.on = false;
        this.setState({tiles});
      } else {
        this.setState({
          cursor: {...cursor, x:Math.max(0,cursor.x-1)}
        });
      }
    } else if (e.code == 'ArrowRight') {
      if (e.ctrlKey) {
        const tiles = clone(this.state.tiles);
        const tile = tiles[cursor.z][cursor.y][cursor.x];
        if (tile != null && tile.color == 'G')
          tile.direction = 'R';
        if (tile != null && tile.color == 'Y')
          tile.charge = '+';
        if (tile != null && tile.color == 'W')
          tile.on = true;
        this.setState({tiles});
      } else {
        this.setState({
          cursor: {...cursor, x:Math.min(this.state.width-1,cursor.x+1)}
        });
      }
    } else if (e.code == 'ArrowDown') {
      if (e.ctrlKey && e.shiftKey) {
        const player = clone(this.state.player);
        player.blueUses = Math.max(0, player.blueUses-1);
        this.setState({player});
      } else if (e.ctrlKey) {
        const tiles = clone(this.state.tiles);
        const tile = tiles[cursor.z][cursor.y][cursor.x];
        if (tile != null && tile.color == 'G')
          tile.direction = 'D';
        if (tile != null && tile.color == 'W')
          tile.walkable = false;
        this.setState({tiles});
      } else if (e.shiftKey) {
        const tiles = clone(this.state.tiles);
        const tile = tiles[cursor.z][cursor.y][cursor.x];
        if (tile != null)
          tile.uses = Math.max(0, tile.uses-1);
        if (tile.color == 'S') {
          const otherTile = tiles[cursor.z + (tile.direction == 'U' ? 1 : -1)][cursor.y][cursor.x];
          otherTile.uses = Math.max(0, otherTile.uses-1);
        }
        this.setState({tiles});
      } else {
        this.setState({
          cursor: {...cursor, y:Math.min(this.state.height-1,cursor.y+1)}
        });
      }
    } else if (e.code == 'ArrowUp') {
      if (e.ctrlKey && e.shiftKey) {
        const player = clone(this.state.player);
        player.blueUses = player.blueUses + 1;
        this.setState({player});
      } else if (e.ctrlKey) {
        const tiles = clone(this.state.tiles);
        const tile = tiles[cursor.z][cursor.y][cursor.x];
        if (tile != null && tile.color == 'G')
          tile.direction = 'U';
        if (tile != null && tile.color == 'W')
          tile.walkable = true;
        this.setState({tiles});
      } else if (e.shiftKey) {
        const tiles = clone(this.state.tiles);
        const tile = tiles[cursor.z][cursor.y][cursor.x];
        if (tile != null)
          tile.uses = tile.uses+1;
        if (tile.color == 'S') {
          const otherTile = tiles[cursor.z + (tile.direction == 'U' ? 1 : -1)][cursor.y][cursor.x];
          otherTile.uses = otherTile.uses+1;
        }
        this.setState({tiles});
      } else {
        this.setState({
          cursor: {...cursor, y:Math.max(0,cursor.y-1)}
        });
      }
    } else if (e.code == 'PageUp') {
      this.setState({
        cursor: {...cursor, z:Math.min(this.state.depth-1,cursor.z+1)}
      });
    } else if (e.code == 'PageDown') {
      this.setState({
        cursor: {...cursor, z:Math.max(0,cursor.z-1)}
      });
    } else if (e.code == 'Delete' || e.key == 'Backspace') {
      const tiles = clone(this.state.tiles);
      deleteTile(tiles, cursor);
      this.setState({tiles});
    } else if (e.code == 'KeyQ') {
      const tiles = clone(this.state.tiles);
      deleteTile(tiles, cursor);
      tiles[cursor.z][cursor.y][cursor.x] = {
        color: 'W',
        on: false,
        walkable: true,
        uses: 0,
      };
      this.setState({tiles});
    } else if (e.code == 'KeyW') {
      const tiles = clone(this.state.tiles);
      deleteTile(tiles, cursor);
      tiles[cursor.z][cursor.y][cursor.x] = {
        color: 'R',
        walkable: true,
        uses: 0,
      };
      this.setState({tiles});
    } else if (e.code == 'KeyE') {
      const tiles = clone(this.state.tiles);
      deleteTile(tiles, cursor);
      tiles[cursor.z][cursor.y][cursor.x] = {
        color: 'B',
        walkable: true,
        uses: 0,
      };
      this.setState({tiles});
    } else if (e.code == 'KeyR') {
      const tiles = clone(this.state.tiles);
      deleteTile(tiles, cursor);
      tiles[cursor.z][cursor.y][cursor.x] = {
        color: 'G',
        walkable: true,
        direction: 'R',
        uses: 0,
      };
      this.setState({tiles});
    } else if (e.code == 'KeyT') {
      const tiles = clone(this.state.tiles);
      deleteTile(tiles, cursor);
      tiles[cursor.z][cursor.y][cursor.x] = {
        color: 'Y',
        charge: '+',
        walkable: true,
        uses: 0,
      };
      this.setState({tiles});
    } else if (e.code == 'KeyY') {
      const tiles = clone(this.state.tiles);
      deleteTile(tiles, cursor);
      tiles[cursor.z][cursor.y][cursor.x] = {
        color: 'O',
        walkable: true,
        uses: 0,
      };
      this.setState({tiles});
    } else if (e.code == 'KeyU') {
      const tiles = clone(this.state.tiles);
      if (cursor.z < this.state.depth-1) {
        deleteTile(tiles, cursor);
        tiles[cursor.z][cursor.y][cursor.x] = {
          color: 'S',
          walkable: true,
          uses: 1,
          direction: 'U',
        };
        tiles[cursor.z+1][cursor.y][cursor.x] = {
          color: 'S',
          walkable: true,
          uses: 1,
          direction: 'D',
        };
      } else if (cursor.z == this.state.depth-1 && this.state.depth > 1) {
        deleteTile(tiles, cursor);
        tiles[cursor.z][cursor.y][cursor.x] = {
          color: 'S',
          walkable: true,
          uses: 1,
          direction: 'D',
        };
        tiles[cursor.z-1][cursor.y][cursor.x] = {
          color: 'S',
          walkable: true,
          uses: 1,
          direction: 'U',
        };
      }
      this.setState({tiles});
    } else if (e.code == 'Space') {
      const player = clone(this.state.player);
      player.x = cursor.x;
      player.y = cursor.y;
      player.z = cursor.z;
      this.setState({player});
    } else {
      return false;
    }
    return true;
  };

  render() {
    const {width, height, depth, mode} = this.state;
    return <div>
      {mode == 'play' ? (<p><b>Play mode instructions:</b>Press left,down,up,right to move. Press space to use a tile. Press z to undo and r to restart.</p>) :
      (<p><b>Edit mode instructions:</b>
      The input fields at the bottom are used to change the dimensions of the level.
      Press left,down,up,right,page up, page down to move the cursor.
      Press space to place the player's starting position on the cursor location.
      Press Q,W,E,R,T,Y,U to put down a tile of the appropriate color on the cursor location.
      Press backspace or delete to clear the tile on the cursor location.
      Hold shift and press up or down to increment/decrement the tile use on the cursor location. 
      Hold ctrl and press left,down,up,right to modify tile specific properties e.g. the direction on green tiles).
      Hold ctrl and shift and press up or down to increment/decrement the player's initial blue uses.
      Press tab to switch between 'edit' and 'play' mode.
      </p>)}
      <canvas ref="canvas" width="640" height="480"></canvas>

      <div>
        <button onClick={this.shareState}>Share</button>
      </div>
      <div>
        Mode: <button onClick={this.switchMode}>{mode == 'edit' ? "Edit" : "Play"}</button>
      </div>
      {mode == 'edit' ?
      (<form>
        <button type="submit" disabled style={{display: 'none'}} aria-hidden="true"></button>
        <input type="number" min="1" max="9" onChange={this.updateWidth} value={width}/>
        <input type="number" min="1" max="9" onChange={this.updateHeight} value={height}/>
        <input type="number" min="1" max="9" onChange={this.updateDepth} value={depth}/>
      </form>)
      : null}
      <div>
        Undo stack:<ul>
          {undoStack.map(action => (<li>{action}</li>))}
        </ul>
      </div>
    </div>;
  }

  switchMode = () => {
    if (this.state.mode == 'edit') {
      this.setState({mode: 'play'});
    } else {
      this.setState(clone(editorState));
    }
    this.refs.canvas.focus();
  }

  shareState = () => {
    const encodedState = lzstring.compressToBase64(JSON.stringify({...editorState, mode: 'edit', undoStack: undoStack, editorState}));
    navigator.clipboard.writeText(`https://${location.hostname}${location.pathname}#${encodedState}`);
  };

  updateWidth = (e) => {
    if (e.target.value >= 1 && e.target.value <= 9) {
      this.setState({width: e.target.value});
      const tiles = clone(this.state.tiles);
      for (let z = 0; z < this.state.depth; z++) {
        for (let y = 0; y < this.state.height; y++) {
          tiles[z][y] = tiles[z][y].slice(0, e.target.value);
          for (let x = tiles[z][y].length; x < e.target.value; x++) {
            tiles[z][y].push(null);
          }
        }
      }
      const cursor = clone(this.state.cursor);
      cursor.x = Math.min(cursor.x, e.target.value-1);
      this.setState({tiles, cursor});
    }
  };

  updateHeight = (e) => {
    if (e.target.value >= 1 && e.target.value <= 9) {
      this.setState({height: e.target.value});
      const tiles = clone(this.state.tiles);
      for (let z = 0; z < this.state.depth; z++) {
        tiles[z] = tiles[z].slice(0, e.target.value);
        for (let y = tiles[z].length; y < e.target.value; y++) {
          const row = [];
          for (let x = 0; x < this.state.width; x++) {
            row.push(null);
          }
          tiles[z].push(row);
        }
      }
      const cursor = clone(this.state.cursor);
      cursor.y = Math.min(cursor.y, e.target.value-1);
      this.setState({tiles, cursor});
    }
  };

  updateDepth = (e) => {
    if (e.target.value >= 1 && e.target.value <= 9) {
      this.setState({depth: e.target.value});
      const tiles = clone(this.state.tiles);
      tiles = tiles.slice(0, e.target.value);
      for (let z = tiles.length; z < e.target.value; z++) {
        const plane = []
        for (let y = 0; y < this.state.height; y++) {
          const row = [];
          for (let x = 0; x < this.state.width; x++) {
            row.push(null);
          }
          plane.push(row);
        }
        tiles.push(plane);
      }
      const cursor = clone(this.state.cursor);
      cursor.z = Math.min(cursor.z, e.target.value-1);
      this.setState({tiles, cursor});
    }
  };
}

const mountNode = document.getElementById('gui');
ReactDOM.render(<EditorGui/>, mountNode);
