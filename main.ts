const tempCanvas = document.createElement('canvas');
tempCanvas.width = 640; tempCanvas.height = 480;
const tempContext = tempCanvas.getContext('2d');
const GRID_SIZE = 48;
const TILE_STROKE_WIDTH = 4;
const BORDER_STROKE_WIDTH = 3;

type BaseTile = {
  x: number, 
  y: number,
  z: number,
  uses: number,
  walkable: boolean,
};

type WhiteTile = BaseTile & {
  color: 'W',
  on: boolean,
};

type RedTile = BaseTile & {
  color: 'R',
};

type GreenTile = BaseTile & {
  color: 'G',
  direction: 'L' | 'R' | 'U' | 'D',
};

type BlueTile = BaseTile & {
  color: 'B',
};

type OrangeTile = BaseTile & {
  color: 'O',
};

type YellowTile = BaseTile & {
  color: 'Y',
  charge: '+' | '-',
};

type StairTile = BaseTile & {
  color: 'S',
  direction: 'U' | 'D',
};


type Tile = WhiteTile | RedTile | GreenTile | BlueTile | OrangeTile | YellowTile | StairTile;

type Player = {
  x: number,
  y: number,
  z: number,
  blueUses: number,
};

type State = {
  mode: 'edit' | 'play',
  cursor: {
    x: number,
    y: number,
    z: number
  },
  tiles: (Tile|null)[][][],
  width: number,
  height: number,
  depth: number,
  player: Player,
};


function drawTile(tile: Tile) {
  const colors = {
    'W': {
      true: '#FFFFFF',
      false: '#888888',
    },
    'R': '#C41E3A',
    'G': '#009E60',
    'B': '#0051BA',
    'O': '#FF5800',
    'Y': '#FFD500',
    'S': '#614878',
  }; 
  const color = tile.color == 'W' ? colors[tile.color][tile.on] : colors[tile.color];
  strokeRect(
    tile.x*GRID_SIZE+1.5*TILE_STROKE_WIDTH,
    tile.y*GRID_SIZE+1.5*TILE_STROKE_WIDTH,
    GRID_SIZE-3*TILE_STROKE_WIDTH,
    GRID_SIZE-3*TILE_STROKE_WIDTH,
    color,
    TILE_STROKE_WIDTH,
  );
  if (tile.color == 'G') {
    const arrows = {
      'U': '🡅',
      'D': '🡇',
      'R': '🡆',
      'L': '🡄',
    }
    tempContext.font = `${GRID_SIZE/3}px sans-serif`;
    tempContext.fillStyle = color
    tempContext.textBaseline='middle';
    tempContext.textAlign='center';
    tempContext.fillText(arrows[tile.direction],(tile.x+0.35)*GRID_SIZE,(tile.y+0.65)*GRID_SIZE);
  } else if (tile.color == 'Y') {
    tempContext.font = `${GRID_SIZE/2}px sans-serif`;
    tempContext.fillStyle = color;
    tempContext.textBaseline='middle';
    tempContext.textAlign='center';
    tempContext.fillText(tile.charge, (tile.x+0.35)*GRID_SIZE,(tile.y+0.65)*GRID_SIZE);
  } else if (tile.color == 'S') {
    tempContext.font = `${0.3*GRID_SIZE}px sans-serif`;
    tempContext.fillStyle = color;
    tempContext.textBaseline='middle';
    tempContext.textAlign='center';
    tempContext.fillText(tile.direction == 'D' ? '⏬' : '⏫', (tile.x+0.35)*GRID_SIZE,(tile.y+0.65)*GRID_SIZE);
  }
}

function drawBorder(width: number, height: number) {
  strokeRect(
    BORDER_STROKE_WIDTH/2,
    BORDER_STROKE_WIDTH/2,
    width*GRID_SIZE-BORDER_STROKE_WIDTH/2,
    height*GRID_SIZE-BORDER_STROKE_WIDTH/2,
    '#666',
    BORDER_STROKE_WIDTH,
  );
}

function drawCursor(cursor: {x: number, y:number}) {
  tempContext.fillStyle = 'rgba(255,255,255,0.5)';
  tempContext.beginPath();
  tempContext.rect(
    cursor.x*GRID_SIZE,
    cursor.y*GRID_SIZE,
    GRID_SIZE,
    GRID_SIZE
  );
  tempContext.fill();
}

function drawPlayer(player: Player) {
  tempContext.fillStyle = player.blueUses == 0 ? 'white' : '#0051BA';
  tempContext.beginPath();
  tempContext.arc(
    (player.x+0.5)*GRID_SIZE,
    (player.y+0.5)*GRID_SIZE,
    (GRID_SIZE-3*BORDER_STROKE_WIDTH)/2*0.5,
    0,
    2*Math.PI,
  );
  tempContext.fill();
  if (player.blueUses > 0) {
    tempContext.font = `${GRID_SIZE/4}px sans-serif`;
    tempContext.fillStyle = 'rgba(255,255,255,1.0)';
    tempContext.textBaseline='middle';
    tempContext.textAlign='center';
    tempContext.fillText(player.blueUses.toString(10),(player.x+0.5)*GRID_SIZE,(player.y+0.525)*GRID_SIZE);
  }
}

function drawLayer(context, z: number, currentDepth: number, isEditMode) {
  context.save();
  context.globalAlpha = z < currentDepth ? 0.15 : (z > currentDepth ? 0.3 : 1.0);
  if (!isEditMode) {
    context.transform(1,0,-0.3,1,225,100);
    context.drawImage(tempCanvas,-0.3*(z-currentDepth)*GRID_SIZE*0.75,-(z-currentDepth)*GRID_SIZE*0.75);
  } else {
    context.transform(1,0,0,1,150,100);
    context.drawImage(tempCanvas,0.5*(z-currentDepth)*GRID_SIZE*0.75,-(z-currentDepth)*GRID_SIZE*0.75);
  }
  context.restore();
}

function drawState(canvas, state: State) {
  const context = canvas.getContext('2d');
  context.fillStyle = 'black';
  context.fillRect(0,0,canvas.width,canvas.height);
  for (let z = 0; z < state.depth; z++) {
    tempContext.clearRect(0,0,tempCanvas.width,tempCanvas.height);
    drawBorder(state.width, state.height);
    if (z == state.player.z) {
      drawPlayer(state.player);
      for (const row of state.tiles[z]) {
        for (const tile of row) {
          if (tile != null) {
            drawTile(tile);
          }
        }
      }
    }
    if (z == state.cursor.z) {
      drawCursor(state.cursor);
    }
    drawLayer(context,z,state.mode == 'edit' ? state.cursor.z : state.player.z,state.mode == 'edit');
  }
}

function strokeRect(x,y,w,h,strokeStyle,lineWidth) {
  tempContext.save();
  tempContext.beginPath();
  tempContext.rect(x,y,w,h);
  tempContext.strokeStyle = strokeStyle;
  tempContext.lineWidth = lineWidth;
  tempContext.stroke();
  tempContext.restore();
}

function generateDefaultState(): State {
  const s = {}
  s.mode = 'edit';
  s.width = 5;
  s.height = 5;
  s.depth = 1;
  s.player = {
    x: 2,
    y: 2,
    z: 0,
    blueUses: 0,
  };
  s.cursor = {
    x: 0,
    y: 0,
    z: 0,
  };
  s.tiles = []
  for (let z = 0; z < s.depth; z++) {
    const plane = [];
    for (let y = 0; y < s.height; y++) {
      const row = [];
        for (let x = 0; x < s.width; x++) {
          row.push(null);
        }
      plane.push(row);
    }
    s.tiles.push(plane);
  }
  return s;
}

const state = generateDefaultState();

export {
  generateDefaultState,
  cloneState,
  drawState
};
