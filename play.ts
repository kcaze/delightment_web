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
    var x = player.x + d[currentTile.direction][0];
    var y = player.y + d[currentTile.direction][1];
    if (x < 0 || x >= state.width) return;
    if (y < 0 || y >= state.height) return;
    const otherTile = tiles[player.z][y][x];
    if (otherTile && otherTile.color == 'S') {
      var dx = -d[currentTile.direction][0];
      var dy = -d[currentTile.direction][1];
      var xx = player.x; 
      var yy = player.y; 
      var zz = otherTile.direction == 'U' ? (player.z + 1) : (player.z-1);
      var hasEmpty = false;
      while (xx >= 0 && xx < state.width && yy >= 0 && yy < state.height) {
        if (tiles[zz][yy][xx] == null) {
          hasEmpty = true;
          break;
        }
        xx += dx;
        yy += dy;
      } 
      if (!hasEmpty) return;
      while (xx != x || yy != y) {
        tiles[zz][yy][xx] = tiles[zz][yy-dy][xx-dx];
        xx -= dx;
        yy -= dy;
      }
      tiles[zz][yy][xx] = null;
    }
    currentTile.uses -= 1;
    tiles[player.z][player.y][player.x] = otherTile;
    tiles[player.z][y][x] = currentTile;
    player.x = x;
    player.y = y;
  }
  return state;
}
export {play};
