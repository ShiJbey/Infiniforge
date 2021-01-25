import { wfc } from '../src/lib/wavefunctioncollapse/wfc';
import { Heap } from 'heap-js';

function testHeapJs() {
  type Entry = [number, number];

  const heap = new Heap<Entry>((a, b) => a[1] - b[1]);
  heap.push([0, 10]);
  heap.push([1, 5]);
  heap.push([2, 6]);
  heap.push([3, 3]);

  console.log('=====================');
  console.log('Before');
  console.log(Heap.print<Entry>(heap));
  console.log('=====================');

  heap.remove([2, 4], (e, o) => e[0] == o[0]);
  heap.push([2, 4]);

  console.log('=====================');
  console.log('After');
  console.log(Heap.print<Entry>(heap));
  console.log('=====================');
}

function testWFC() {
  const res: string[] = wfc(7);
  console.log(res);
}

(function main() {
  // testHeapJs();
  testWFC();
})();
