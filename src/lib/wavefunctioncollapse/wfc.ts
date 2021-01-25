import _, { update } from 'lodash';
import { Heap } from 'heap-js';
import { getRandomInt } from '../../core/utilities/utils';

enum DIRECTION {
  left = 'left',
  right = 'right',
}

/** WFC Tile used for blade generation */
interface BladeTile {
  /** Name of tile in format 'type namespace/tile-name'
   *  Example: 'edge/flat' or 'tip/round')
   */
  name: string;
  /** Chance of seeing this tile */
  weight: number;
  /** Rules for what may go left and right of this tile */
  rules: {
    left: string[];
    right: string[];
  };
}

const TILES: BladeTile[] = [
  {
    name: 'edge/flat',
    weight: 1,
    rules: {
      left: ['edge/flat', 'edge/flat-neg', 'edge/flat-pos', 'edge/sin'],
      right: ['edge/flat', 'edge/flat-neg', 'edge/flat-pos', 'edge/sin'],
    },
  },
  {
    name: 'edge/flat-pos',
    weight: 2,
    rules: {
      left: ['edge/flat', 'edge/flat-neg', 'edge/sin'],
      right: ['edge/flat', 'edge/flat-neg', 'edge/sin'],
    },
  },
  {
    name: 'edge/flat-neg',
    weight: 2,
    rules: {
      left: ['edge/flat', 'edge/flat-pos', 'edge/sin'],
      right: ['edge/flat', 'edge/flat-pos', 'edge/sin'],
    },
  },
  {
    name: 'edge/sin',
    weight: 3,
    rules: {
      left: ['edge/flat', 'edge/flat-pos', 'edge/flat-neg', 'edge/flat-neg'],
      right: ['edge/flat', 'edge/flat-pos', 'edge/flat-neg', 'edge/flat-neg'],
    },
  },
];

const TILE_WEIGHTS: number[] = ((): number[] =>
  TILES.map((tile) => tile.weight))();

const TILE_WEIGHT_LOG_WEIGHTS: number[] = ((): number[] =>
  TILES.map((tile) => tile.weight * Math.log(tile.weight)))();

/** Get the neighboring cel position given a direction */
function neighbor(cellPosition: number, direction: string): number {
  if (direction === 'left') {
    return cellPosition - 1;
  }
  return cellPosition + 1;
}

/** Return all compatible tile indices for a given tile index and a direction */
function compatibleTiles(tileIndex: number, direction: string): number[] {
  const targetTile = TILES[tileIndex];
  const compatible: number[] = [];
  TILES.forEach((tile, index) => {
    if (direction === 'left' && tile.rules.left.includes(targetTile.name)) {
      compatible.push(index);
    } else if (
      direction === 'right' &&
      tile.rules.right.includes(targetTile.name)
    ) {
      compatible.push(index);
    }
  });
  return compatible;
}

interface TileEnablerCount {
  [direction: string]: number;
}

/** Get the enabler counts for each tile */
function initialTileEnablerCounts(): TileEnablerCount[] {
  const ret: TileEnablerCount[] = [];

  _.range(TILES.length).forEach((tileIndex) => {
    const counts: TileEnablerCount = {
      left: 0,
      right: 0,
    };

    for (const dir in DIRECTION) {
      counts[dir] = compatibleTiles(tileIndex, dir).length;
    }

    ret.push(counts);
  });

  return ret;
}

function containsAnyZeroCount(enablerCount: TileEnablerCount): boolean {
  for (const dir in DIRECTION) {
    if (enablerCount[dir] === 0) {
      return true;
    }
  }
  return false;
}

/** Single cell within the output row */
class WFCCell {
  /** Tile index this cell has collapsed to */
  public tile: number;

  /** Has this cell been collapsed */
  public isCollapsed: boolean;

  /** Is the tile at an index valid for this cell */
  private possible: boolean[];

  /** Cached the sum of the weights of all possible tiles */
  private sumOfPossibleTileWeights: number;

  /** Cache the sum of the weight*log(weight) for all possible tiles */
  private sumOfPossibleTileWeightLogWeights: number;

  /** Noise added to the entropy of this cell to help prevent ties */
  private entropyNoise: number;

  /** Count the number of enabling tiles in each direction for each tile */
  public tileEnablerCounts: TileEnablerCount[];

  constructor(noise: number) {
    this.possible = _.range(TILES.length).map(() => true);
    this.sumOfPossibleTileWeights = this.getSumPossibleTileWeight();
    this.sumOfPossibleTileWeightLogWeights = this.getSumPossibleTileWeightLogWeight();
    this.tile = -1;
    this.isCollapsed = false;
    this.entropyNoise = noise;
    this.tileEnablerCounts = initialTileEnablerCounts();
  }

  /** Get the sum of the weights of all possible tiles */
  private getSumPossibleTileWeight(): number {
    let total = 0;
    this.possible.forEach((isPossible, index) => {
      if (isPossible) {
        total += TILES[index].weight;
      }
    });
    return total;
  }

  /** Get the sum of the weight * log(wieght) of all possible tiles */
  private getSumPossibleTileWeightLogWeight(): number {
    let total = 0;
    this.possible.forEach((isPossible, index) => {
      if (isPossible) {
        total += TILE_WEIGHT_LOG_WEIGHTS[index];
      }
    });
    return total;
  }

  /** Get the indices of possible tiles for this cell */
  getPossibleTiles(): number[] {
    const possibleTiles: number[] = [];
    this.possible.forEach((isPossible, tileIndex) => {
      if (isPossible) {
        possibleTiles.push(tileIndex);
      }
    });
    return possibleTiles;
  }

  /** Total Entropy of this Cell */
  entropy(): number {
    return (
      Math.log(this.sumOfPossibleTileWeights) -
      this.sumOfPossibleTileWeightLogWeights / this.sumOfPossibleTileWeights +
      this.entropyNoise
    );
  }

  /** Set a tile as impossible for this cell */
  removeTile(index: number): void {
    this.possible[index] = false;
    // Update cached values for entropy calculation
    this.sumOfPossibleTileWeights -= TILE_WEIGHTS[index];
    this.sumOfPossibleTileWeightLogWeights -= TILE_WEIGHT_LOG_WEIGHTS[index];
  }

  /** Randomly choose a tile index for this cell and return it */
  choose_tile_index(rng: () => number): number {
    let remaining = getRandomInt(rng, 0, this.sumOfPossibleTileWeights);
    const possibleTiles = this.getPossibleTiles();
    for (const tileIndex of possibleTiles) {
      const weight = TILE_WEIGHTS[tileIndex];
      if (remaining > weight) {
        remaining -= weight;
      } else {
        this.tile = tileIndex;
        return tileIndex;
      }
    }
    throw new Error(
      'Sum of possible weights was inconsistent with possible tiles and tile weights'
    );
  }

  /** Collapse this cell and return a list of the removed possible tile indices */
  collapse(rng: () => number): number[] {
    this.choose_tile_index(rng);
    this.isCollapsed = true;
    const removedPossibilities: number[] = [];
    // Mark all possible values that are not at the tile index as false
    for (let i = 0; i < this.possible.length; i++) {
      if (i !== this.tile) {
        this.possible[i] = false;
        removedPossibilities.push(i);
      }
    }
    return removedPossibilities;
  }
}

/** Cell entropy entry for the entropy Heap */
interface EntropyEntry {
  /** Index of cell in the State grid */
  cell: number;
  /** Entropy of the cell */
  entropy: number;
}

interface TileRemovalUpdate {
  tile: number;
  cell: number;
}

/** State of the WFC algorithm */
class WFCState {
  /** Single row grid of cells */
  grid: WFCCell[];

  /** Random number generator function */
  rng: () => number;

  /** Number of cells that have not been collapsed */
  remainingUncollapsedCells: number;

  /** Min Heap of cells ordered by entropy */
  entropyHeap: Heap<EntropyEntry>;

  /** Records of potential tiles being removed from cells */
  tileRemovals: TileRemovalUpdate[];

  /** Did the state encounter a contradiction */
  contradictionFound: boolean;

  constructor(grid: WFCCell[], rng: () => number) {
    this.grid = grid;
    this.rng = rng;
    this.remainingUncollapsedCells = grid.length;
    this.entropyHeap = new Heap<EntropyEntry>((a, b) => a.entropy - b.entropy);
    for (let i = 0; i < this.grid.length; i++) {
      this.entropyHeap.push({
        cell: i,
        entropy: this.grid[i].entropy(),
      });
    }
    this.tileRemovals = [];
    this.contradictionFound = false;
  }

  /** Is the given index outside the bounds of the grid */
  private outOfBounds(index: number): boolean {
    return index < 0 || index >= this.grid.length;
  }

  /** Return the index of an uncollapsed cell in the grid with the lowest entropy */
  private chooseNextCell(): number {
    while (!this.entropyHeap.isEmpty()) {
      const entropyEntry = this.entropyHeap.pop();

      if (!entropyEntry) {
        break;
      }

      const cell = this.grid[entropyEntry.cell];
      if (!cell.isCollapsed) {
        return entropyEntry.cell;
      }
    }
    throw new Error('Heap is empty, but there are uncollapsed cells');
  }

  /** Collapse the cell at the given index */
  private collapseCellAt(index: number): void {
    const cell = this.grid[index];
    const removedPossibilties = cell.collapse(this.rng);

    this.tileRemovals.push(
      ...removedPossibilties.map(
        (tileIndex): TileRemovalUpdate => ({
          tile: tileIndex,
          cell: index,
        })
      )
    );
  }

  /** Propagate the effects of collapsing a cell */
  private propagate(): void {
    // Loop though all of the tile removal updates
    // from the most recent cell collapse
    let removalUpdate = this.tileRemovals.pop();
    while (removalUpdate) {
      // Update the cells in each of the adjacent directions
      for (const direction in DIRECTION) {
        const { cell: collapsedCell, tile: removedTile } = removalUpdate;

        const neighborPosition = neighbor(collapsedCell, direction);

        if (this.outOfBounds(neighborPosition)) {
          continue;
        }

        const neighborCell = this.grid[neighborPosition];

        if (neighborCell.isCollapsed) {
          continue;
        }

        const compatible = compatibleTiles(removedTile, direction);

        // Loop through the tiles that were compatible with
        // the tile that was removed
        for (const tile of compatible) {
          // Get the number of enabler to the left and right of this tile
          const enablerCounts = neighborCell.tileEnablerCounts[tile];

          if (enablerCounts[direction] == 1) {
            if (!containsAnyZeroCount(enablerCounts)) {
              neighborCell.removeTile(tile);

              if (neighborCell.getPossibleTiles().length === 0) {
                // Contradiction
                this.contradictionFound = true;
                return;
              }

              const updatedEntropy: EntropyEntry = {
                cell: neighborPosition,
                entropy: neighborCell.entropy(),
              };

              this.entropyHeap.remove(
                updatedEntropy,
                (e, o) => e.cell == o.cell
              );

              this.entropyHeap.push(updatedEntropy);

              this.tileRemovals.push({
                cell: neighborPosition,
                tile,
              });
            }
          }

          enablerCounts[direction] -= 1;
        }
      }

      removalUpdate = this.tileRemovals.pop();
    }
  }

  /** Run the Wave Function Collapse algorithm  */
  run(): boolean {
    while (this.remainingUncollapsedCells > 0) {
      const nextIndex = this.chooseNextCell();
      this.collapseCellAt(nextIndex);
      this.propagate();

      if (this.contradictionFound) {
        return false;
      }

      this.remainingUncollapsedCells -= 1;
    }
    return true;
  }
}

/** Implementation of the Wave Function Collapse Algrorithm
 *
 * Here I choose to treat a sword as a tile-based grid
 * with a single row of tiles. Each tile is a string
 * coresponding to the type of curve used when modifying
 * the edges of the blade. For example, the following tile
 * output, ['edge/flat', 'edge/flat-positive', 'edge/sin',
 * 'tip/standard'], will produce a blade edhe that starts flat, expands
 * outward, then has a sin curve.
 *
 * Credit:
 * https://github.com/mxgmn/WaveFunctionCollapse
 * https://www.gridbugs.org/wave-function-collapse/
 *
 * @param size the number of tiles to return
 */
export function wfc(size: number, rng: () => number = Math.random): string[] {
  let solutionFound = false;

  let state = new WFCState(
    _.range(size).map(() => new WFCCell(rng() * 0.000001)),
    rng
  );

  while (!solutionFound) {
    solutionFound = state.run();
    if (!solutionFound) {
      state = new WFCState(
        _.range(size).map(() => new WFCCell(rng() * 0.000001)),
        rng
      );
    }
  }

  // Map the final tile indices back to their names
  return state.grid.map((cell) => TILES[cell.tile].name);
}
