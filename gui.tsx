import * as React from 'react';
import ReactDOM from 'react-dom';
import {generateDefaultState, drawState} from './main';

function clone(obj: Object): Object {
  return JSON.parse(JSON.stringify(obj));
}

class EditorGui extends React.Component {
  constructor() {
    this.state = generateDefaultState();
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
  
  render() {
    const {width, height, depth, mode} = this.state;
    console.log(width, height, depth, JSON.stringify(this.state.tiles, null, 2);
    return <div>
      <canvas ref="canvas" width="640" height="480"></canvas>
      <div>Mode: {mode == 'edit' ? "Edit" : "Play"}</div>
      <form>
        <button type="submit" disabled style={{display: 'none'}} aria-hidden="true"></button>
        <input type="number" min="1" max="9" onChange={this.updateWidth} value={width}/>
        <input type="number" min="1" max="9" onChange={this.updateHeight} value={height}/>
        <input type="number" min="1" max="9" onChange={this.updateDepth} value={depth}/>
      </form>
    </div>;
  }

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
