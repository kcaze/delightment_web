const tempCanvas = document.createElement('canvas');
tempCanvas.width = 640; tempCanvas.height = 480;
const tempContext = tempCanvas.getContext('2d');
const GRID_SIZE = 48;
const TILE_STROKE_WIDTH = 4;
const BORDER_STROKE_WIDTH = 3;

type BaseTile = {
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


function drawTile(tile: Tile, x: number, y: number) {
  const colors = {
    'W': {
      true: '#FFFFFF',
      false: '#666',
    },
    'R': '#C41E3A',
    'G': '#009E60',
    'B': '#0051BA',
    'O': '#FF5800',
    'Y': '#FFD500',
    'S': '#614878',
  }; 
  const color = tile.color == 'W' ? colors[tile.color][tile.on] : colors[tile.color];
  if (tile.walkable) {
    strokeRect(
      x*GRID_SIZE+1.5*TILE_STROKE_WIDTH,
      y*GRID_SIZE+1.5*TILE_STROKE_WIDTH,
      GRID_SIZE-3*TILE_STROKE_WIDTH,
      GRID_SIZE-3*TILE_STROKE_WIDTH,
      color,
      TILE_STROKE_WIDTH,
    );
  } else {
    tempContext.strokeStyle = color;
    tempContext.lineWidth = TILE_STROKE_WIDTH/Math.sqrt(2);
    tempContext.beginPath();
    tempContext.moveTo((x+0.5)*GRID_SIZE, (y+0.1)*GRID_SIZE);
    tempContext.lineTo((x+0.9)*GRID_SIZE, (y+0.5)*GRID_SIZE);
    tempContext.lineTo((x+0.5)*GRID_SIZE, (y+0.9)*GRID_SIZE);
    tempContext.lineTo((x+0.1)*GRID_SIZE, (y+0.5)*GRID_SIZE);
    tempContext.closePath();
    tempContext.stroke();
  }
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
    tempContext.fillText(arrows[tile.direction],(x+0.35)*GRID_SIZE,(y+0.65)*GRID_SIZE);
  } else if (tile.color == 'Y') {
    tempContext.font = `${GRID_SIZE/2}px sans-serif`;
    tempContext.fillStyle = color;
    tempContext.textBaseline='middle';
    tempContext.textAlign='center';
    tempContext.fillText(tile.charge, (x+0.35)*GRID_SIZE,(y+0.65)*GRID_SIZE);
  } else if (tile.color == 'S') {
    tempContext.font = `${0.3*GRID_SIZE}px sans-serif`;
    tempContext.fillStyle = color;
    tempContext.textBaseline='middle';
    tempContext.textAlign='center';
    tempContext.fillText(tile.direction == 'D' ? '⏬' : '⏫', (x+0.35)*GRID_SIZE,(y+0.65)*GRID_SIZE);
  }
  if (tile.uses > 0) {
    tempContext.font = `${GRID_SIZE/3}px sans-serif`;
    tempContext.fillStyle = color;
    tempContext.textBaseline='middle';
    tempContext.textAlign='center';
    tempContext.fillText(tile.uses.toString(), (x+0.70)*GRID_SIZE,(y+0.70)*GRID_SIZE);
  }
}

function drawBorder(width: number, height: number) {
  strokeRect(
    BORDER_STROKE_WIDTH/2,
    BORDER_STROKE_WIDTH/2,
    width*GRID_SIZE-BORDER_STROKE_WIDTH/2,
    height*GRID_SIZE-BORDER_STROKE_WIDTH/2,
    '#444',
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
  if (!isEditMode) {
    context.globalAlpha = z < currentDepth ? 0.15 : (z > currentDepth ? 0.3 : 1.0);
    context.transform(1,0,-0.3,1,225,100);
    context.drawImage(tempCanvas,-0.3*(z-currentDepth)*GRID_SIZE*0.75,-(z-currentDepth)*GRID_SIZE*0.75);
  } else {
    context.globalAlpha = z != currentDepth ? 0.1 : 1.0);
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
    if (state.mode == 'edit' || z == state.player.z) {
      if (z == state.player.z) {
        drawPlayer(state.player);
      }
      for (let y = 0; y < state.tiles[z].length; y++) {
        for (let x = 0; x < state.tiles[z][y].length; x++) {
          if (state.tiles[z][y][x] != null) {
            drawTile(state.tiles[z][y][x],x,y);
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
