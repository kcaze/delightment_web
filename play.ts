import {clone} from './main';

function play(state, input: 'left' | 'up' | 'right' | 'down' | 'act') {
  const nextState = clone(state);
  if (input == 'act') {
    return act(nextState);
  }
}

function act(state) {
  const {tiles, player} = state;
  const currentTile = tiles[player.z][player.y][player.x];
  if (currentTile.uses == 0) {
    return;
  }
  if (currentTile.color == 'R') {
    currentTile.uses -= 1;
    for (const row of tiles[player.z]) {
      for (const tile of row) {
        if (tile != null) {
          tile.walkable = true;
        }
      }
    }
  } else if (currentTile.color == 'B') {
    currentTile.uses -= 1;
    player.blueUses += 1;
  } else if (currentTile.color == 'S') {
    currentTile.uses -= 1;
    const otherTile = tiles[player.z + (currentTile.direction == 'U' ? 1 : -1)][player.y][player.x];
    otherTile.uses -= 1;
    if (currentTile.direction == 'U') {
      player.z += 1;
    } else {
      player.z -= 1;
    }
  } else if (currentTile.color == 'G') {
    const d = {'U':[0,-1],'D':[0,1],'L':[-1,0],'R':[1,0]};
    const dx = d[currentTile.direction][0];
    const dy = d[currentTile.direction][1];
    const x = player.x + dx;
    const y = player.y + dy;
    if (x < 0 || x >= state.width) return;
    if (y < 0 || y >= state.height) return;
    tiles[player.z][player.y][player.x] = null;
    if (!canPush(state,x,y,player.z,-dx,-dy,0)) {
      tiles[player.z][player.y][player.x] = currentTile;
      return;
    }
    push(state,x,y,player.z,-dx,-dy,0);
    tiles[player.z][y][x] = currentTile;
    player.x = x;
    player.y = y;
    currentTile.uses -= 1;
  } else if (currentTile.color == 'Y') {
    currentTile.stuck = true;
    // This is a slow O(n^2) implementation, n = # of tiles
    while(true) {
      const tiles = [];
      for (let z = 0; z < state.depth; z++) {
        for (let y = 0; y < state.height; y++) {
          for (let x = 0; x < state.width; x++) {
            const t = state.tiles[z][y][x];
            if (t != null && t.color == 'Y' && ((x==player.x)+(y==player.y)+(z==player.z)) == 2) {
              tiles.push([t,x,y,z,Math.abs(x-player.x)+Math.abs(y-player.y)+Math.abs(z-player.z)]);
            }
          }
        }
      }
      tiles.sort((t1, t2) => t1[4]-t2[4]);
      const tile = tiles.find(t => !t[0].yellowDone);
      if (tile == null) {
        for (const t of tiles) {
          delete t[0].yellowDone;
        }
        break;
      }
      const [t,x,y,z] = tile;
      if (t.charge == currentTile.charge) {
        // repel
        const dx = Math.sign(x-player.x);
        const dy = Math.sign(y-player.y);
        const dz = Math.sign(z-player.z);
        if (canPush(state,x,y,z,dx,dy,dz)) push(state,x,y,z,dx,dy,dz);
      } else {
        // attract
        const dx = Math.sign(player.x-x);
        const dy = Math.sign(player.y-y);
        const dz = Math.sign(player.z-z);
        if (canPush(state,x,y,z,dx,dy,dz)) push(state,x,y,z,dx,dy,dz);
      }
      t.yellowDone = true;
    }
    delete currentTile.stuck;
    currentTile.charge = currentTile.charge == '-' ? '+' : '-';
    currentTile.uses -= 1;
  } else if (currentTile.color == 'S') {
    currentTile.uses -= 1; 
    state.player.z += currentTile.direction == 'U' ? 1 : -1
  }
  return state;
}

// Returns whether or not the tile at (x,y,z) can be pushed
// in the direction (dx,dy,dz), accounting for stairs wackiness.
function canPush(state, x, y, z, dx, dy, dz) {
  const tile = state.tiles[z][y][x];
  if (tile == null) {
    return true;
  }
  if (tile.stuck || x+dx < 0 || x+dx >= state.width || y+dy < 0 || y+dy >= state.height || z+dz < 0 || z+dz >= state.depth){
    return false;
  } else {
    // Stairs will push up to two blocks in the x or y direction.
    if (tile.color == 'S') {
      if (dz != 0) {
        return canPush(state,x+dx,y+dy,z+dz,dx,dy,dz);
      } else {
        return canPush(state,x+dx,y+dy,z+dz,dx,dy,dz) && canPush(state,x+dx,y+dy,z+(tile.direction=='U'?1:-1)+dz,dx,dy,dz);
      } 
    } else {
      return canPush(state,x+dx,y+dy,z+dz,dx,dy,dz);
    }
  }
}

function push(state, x, y, z, dx, dy, dz) {
  const tile = state.tiles[z][y][x];
  if (tile == null) return;
  if (tile.stuck || x+dx < 0 || x+dx >= state.width || y+dy < 0 || y+dy >= state.height || z+dz < 0 || z+dz >= state.depth) return;
  // Stairs will push up to two blocks in the x or y direction.
  if (tile.color == 'S') {
    if (dz != 0) {
      let firstTile, secondTile;

      if (dz == 1) {
        firstTile = tile.direction == 'U' ? state.tiles[z+1][y][x] : tile;
        secondTile = tile.direction == 'D' ? state.tiles[z-1][y][x] : tile;
        z = firstTile === tile ? z : z+1;
      } else {
        firstTile = tile.direction == 'U' ? tile : state.tiles[z+1][y][x];
        secondTile = tile.direction == 'D' ? tile : state.tiles[z-1][y][x];
        z = firstTile === tile ? z : z-1;
      }
      push(state,x+dx,y+dy,z+dz,dx,dy,dz);
      state.tiles[z+dz][y+dy][x+dx] = state.tiles[z][y][x];
      state.tiles[z][y+dy][x+dx] = state.tiles[z-dz][y][x];
      state.tiles[z-dz][y+dy][x+dx] = null;
    } else {
      const zz = z+(tile.direction =='U'?1:-1);
      push(state,x+dx,y+dy,z+dz,dx,dy,dz);
      push(state,x+dx,y+dy,zz+dz,dx,dy,dz);
      state.tiles[z][y+dy][x+dx] = state.tiles[z][y][x];
      state.tiles[z][y][x] = null;
      state.tiles[zz][y+dy][x+dx] = state.tiles[zz][y][x];
      state.tiles[zz][y][x] = null;
    } 
  } else {
    push(state,x+dx,y+dy,z+dz,dx,dy,dz);
    state.tiles[z+dz][y+dy][x+dx] = state.tiles[z][y][x];
    state.tiles[z][y][x] = null;
  }
}

export {play};

