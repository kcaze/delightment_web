import * as React from 'react';
import ReactDOM from 'react-dom';
import {generateDefaultState, drawState} from './main';

function clone(obj: Object): Object {
  return JSON.parse(JSON.stringify(obj));
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
    if (e.key == 'ArrowLeft') {
      this.setState({
        cursor: {...this.state.cursor, x:Math.max(0,this.state.cursor.x-1)}
      });
    } else if (e.key == 'ArrowRight') {
      this.setState({
        cursor: {...this.state.cursor, x:Math.min(this.state.width-1,this.state.cursor.x+1)}
      });
    } else if (e.key == 'ArrowDown') {
      this.setState({
        cursor: {...this.state.cursor, y:Math.min(this.state.height-1,this.state.cursor.y+1)}
      });
    } else if (e.key == 'ArrowUp') {
      this.setState({
        cursor: {...this.state.cursor, y:Math.max(0,this.state.cursor.y-1)}
      });
    } else if (e.key == 'PageUp') {
      this.setState({
        cursor: {...this.state.cursor, z:Math.min(this.state.depth-1,this.state.cursor.z+1)}
      });
    } else if (e.key == 'PageDown') {
      this.setState({
        cursor: {...this.state.cursor, z:Math.max(0,this.state.cursor.z-1)}
      });
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
      this.setState({tiles});
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
      this.setState({tiles});
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
      this.setState({tiles});
    }
  };
}

const mountNode = document.getElementById('gui');
ReactDOM.render(<EditorGui/>, mountNode);
