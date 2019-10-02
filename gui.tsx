import * as React from 'react';
import ReactDOM from 'react-dom';
import {generateDefaultState, drawState} from './main';

function clone(obj: Object): Object {
  return JSON.parse(JSON.stringify(obj));
}

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

class EditorGui extends React.Component {
  constructor() {
    this.state = generateDefaultState();
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentDidMount() {
    this.updateCanvas(); 
  }

  componentDidUpdate() {
    this.updateCanvas(); 
  }

  updateCanvas() {
    drawState(this.refs.canvas, this.state);
  }

  onKeyDown = (e) => {
    if (this.state.mode == 'edit') {
      this.onEditKeyDown(e);
    } else {
      this.onPlayKeyDown(e);
    }
  };

  onEditKeyDown = (e) => {
    const {cursor} = this.state;
    if (e.code == 'ArrowLeft') {
      if (e.ctrlKey) {
        const tiles = clone(this.state.tiles);
        const tile = tiles[cursor.z][cursor.y][cursor.x];
        if (tile != null && tile.color == 'G')
          tile.direction = 'L';
        if (tile != null && tile.color == 'Y')
          tile.charge = '+';
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
          tile.charge = '-';
        this.setState({tiles});
      } else {
        this.setState({
          cursor: {...cursor, x:Math.min(this.state.width-1,cursor.x+1)}
        });
      }
    } else if (e.code == 'ArrowDown') {
      if (e.ctrlKey) {
        const tiles = clone(this.state.tiles);
        const tile = tiles[cursor.z][cursor.y][cursor.x];
        if (tile != null && tile.color == 'G')
          tile.direction = 'D';
        this.setState({tiles});
      } else if (e.shiftKey) {
        const tiles = clone(this.state.tiles);
        const tile = tiles[cursor.z][cursor.y][cursor.x];
        if (tiles[cursor.z][cursor.y][cursor.x] != null)
          tile.uses = Math.max(0, tile.uses-1);
        this.setState({tiles});
      } else {
        this.setState({
          cursor: {...cursor, y:Math.min(this.state.height-1,cursor.y+1)}
        });
      }
    } else if (e.code == 'ArrowUp') {
      if (e.ctrlKey) {
        const tiles = clone(this.state.tiles);
        const tile = tiles[cursor.z][cursor.y][cursor.x];
        if (tile != null && tile.color == 'G')
          tile.direction = 'U';
        this.setState({tiles});
      } else if (e.shiftKey) {
        const tiles = clone(this.state.tiles);
        const tile = tiles[cursor.z][cursor.y][cursor.x];
        if (tiles[cursor.z][cursor.y][cursor.x] != null)
          tile.uses = tile.uses+1;
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
          uses: 0,
          direction: 'U',
        };
        tiles[cursor.z+1][cursor.y][cursor.x] = {
          color: 'S',
          walkable: true,
          uses: 0,
          direction: 'D',
        };
      } else if (cursor.z == this.state.depth-1 && this.state.depth > 1) {
        deleteTile(tiles, cursor);
        tiles[cursor.z][cursor.y][cursor.x] = {
          color: 'S',
          walkable: true,
          uses: 0,
          direction: 'D',
        };
        tiles[cursor.z-1][cursor.y][cursor.x] = {
          color: 'S',
          walkable: true,
          uses: 0,
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
    }
    console.log(e);
  };

  onPlayKeyDown = (e) => {
  };
  
  render() {
    const {width, height, depth, mode} = this.state;
    return <div>
      <canvas ref="canvas" width="640" height="480"></canvas>

      <div>
        <button onClick={this.shareState}>Share</button>
      </div>
      <div>
        Mode: {mode == 'edit' ? "Edit" : "Play"}
      </div>
      <form>
        <button type="submit" disabled style={{display: 'none'}} aria-hidden="true"></button>
        <input type="number" min="1" max="9" onChange={this.updateWidth} value={width}/>
        <input type="number" min="1" max="9" onChange={this.updateHeight} value={height}/>
        <input type="number" min="1" max="9" onChange={this.updateDepth} value={depth}/>
      </form>
    </div>;
  }

  shareState = () => {
    const encodedState = btoa(JSON.stringify(this.state));
    console.log(encodedState);
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
