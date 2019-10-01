import * as React from 'react';
import ReactDOM from 'react-dom';
import {generateDefaultState, drawState, cloneState} from './main';

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
    const {width, height, depth} = this.state;
    return <div>
      <canvas ref="canvas" width="640" height="480"></canvas>
      <form>
        <button type="submit" disabled style={{display: 'none'}} aria-hidden="true"></button>
        <input type="number" min="1" max="9" onChange={this.updateWidth} value={width}/>
        <input type="number" min="1" max="9" onChange={this.updateHeight} value={height}/>
        <input type="number" min="1" max="9" onChange={this.updateDepth} value={depth}/>
      </form>
    </div>;
  }

  updateWidth = (e) => {
    if (e.target.value >= 1 && e.target.value <= 9)
      this.setState({width: e.target.value});
  };

  updateHeight = (e) => {
    if (e.target.value >= 1 && e.target.value <= 9)
      this.setState({height: e.target.value});
  };

  updateDepth = (e) => {
    if (e.target.value >= 1 && e.target.value <= 9)
      this.setState({depth: e.target.value});
  };
}

const mountNode = document.getElementById('gui');
ReactDOM.render(<EditorGui/>, mountNode);
