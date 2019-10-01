const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const GRID_SIZE = 64;
const TILE_STROKE_WIDTH = 6;
const BORDER_STROKE_WIDTH = 4;

type BaseTile = {
  x: number, 
  y: number,
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


type Tile = WhiteTile | RedTile | GreenTile | BlueTile | OrangeTile | YellowTile;

type Player = {
  x: number,
  y: number,
  blueUses: number,
};

type State = {
  tiles: (Tile|void)[][],
  width: number,
  height: number,
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
    context.font = `${GRID_SIZE/3}px sans-serif`;
    context.fillStyle = color
    context.textBaseline='middle';
    context.textAlign='center';
    context.fillText(arrows[tile.direction],(tile.x+0.35)*GRID_SIZE,(tile.y+0.65)*GRID_SIZE);
  } else if (tile.color == 'Y') {
    context.font = `${GRID_SIZE/2}px sans-serif`;
    context.fillStyle = color;
    context.textBaseline='middle';
    context.textAlign='center';
    context.fillText(tile.charge, (tile.x+0.35)*GRID_SIZE,(tile.y+0.65)*GRID_SIZE);
  }
}

function drawBorder(width: number, height: number) {
  strokeRect(
    BORDER_STROKE_WIDTH/2,
    BORDER_STROKE_WIDTH/2,
    width*GRID_SIZE-BORDER_STROKE_WIDTH/2,
    height*GRID_SIZE-BORDER_STROKE_WIDTH/2,
    '#333333',
    BORDER_STROKE_WIDTH,
  );
}

function drawPlayer(player: Player) {
  context.fillStyle = player.blueUses == 0 ? 'white' : '#0051BA';
  context.beginPath();
  context.arc(
    (player.x+0.5)*GRID_SIZE,
    (player.y+0.5)*GRID_SIZE,
    (GRID_SIZE-3*BORDER_STROKE_WIDTH)/2*0.5,
    0,
    2*Math.PI,
  );
  context.fill();
  if (player.blueUses > 0) {
    context.font = `${GRID_SIZE/4}px sans-serif`;
    context.fillStyle = 'rgba(255,255,255,1.0)';
    context.textBaseline='middle';
    context.textAlign='center';
    context.fillText(player.blueUses.toString(10),(player.x+0.5)*GRID_SIZE,(player.y+0.525)*GRID_SIZE);
  }
}

function drawState(state: State) {
  context.fillStyle = 'black';
  context.fillRect(0,0,canvas.width,canvas.height);
  drawBorder(state.width, state.height);
  drawPlayer(state.player);
  for (const row of state.tiles) {
    for (const tile of row) {
      drawTile(tile);
    }
  }
}

function strokeRect(x,y,w,h,strokeStyle,lineWidth) {
  context.save();
  context.beginPath();
  context.rect(x,y,w,h);
  context.strokeStyle = strokeStyle;
  context.lineWidth = lineWidth;
  context.stroke();
  context.restore();
}

drawState({
  tiles:[[
    {x:0,y:0,uses:0,walkable:0,color:'W',on:false},
    {x:1,y:0,uses:0,walkable:0,color:'W',on:true},
    {x:2,y:0,uses:0,walkable:0,color:'R',on:false},
    {x:3,y:0,uses:0,walkable:0,color:'G',direction:'U'},
    {x:3,y:1,uses:0,walkable:0,color:'G',direction:'D'},
    {x:3,y:2,uses:0,walkable:0,color:'G',direction:'L'},
    {x:3,y:3,uses:0,walkable:0,color:'G',direction:'R'},
    {x:4,y:0,uses:0,walkable:0,color:'Y',charge:'+'},
    {x:4,y:1,uses:0,walkable:0,color:'Y',charge:'-'},
    {x:5,y:0,uses:0,walkable:0,color:'B',on:false},
    {x:6,y:0,uses:0,walkable:0,color:'O',on:false},
  ]],
  width:5,
  height:5,
  player: {
    x: 3,
    y: 0,
    blueUses: 1,
  }
});
