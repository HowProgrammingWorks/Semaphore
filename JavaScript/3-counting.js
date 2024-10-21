'use strict';

const fs = require('node:fs');
const threads = require('node:worker_threads');
const { Worker, isMainThread } = threads;

class CountingSemaphore {
  constructor(shared, offset = 0, initial) {
    this.counter = new Int32Array(shared, offset, 1);
    if (typeof initial === 'number') {
      this.counter[0] = initial;
    }
  }

  enter() {
    while (this.counter[0] === 0);
    this.counter[0]--;
  }

  leave() {
    this.counter[0]++;
  }
}

// Usage

if (isMainThread) {
  const buffer = new SharedArrayBuffer(4);
  // Try to change 10 to 2 at next line to see the problem
  const semaphore = new CountingSemaphore(buffer, 0, 10);
  console.dir({ semaphore: semaphore.counter[0] });
  for (let i = 0; i < 20; i++) {
    new Worker(__filename, { workerData: buffer });
  }
} else {
  const { threadId, workerData } = threads;
  const semaphore = new CountingSemaphore(workerData);
  console.dir({ threadId, semaphore: semaphore.counter[0] });
  const REPEAT_COUNT = 1000000;
  const file = `file-${threadId}.dat`;

  semaphore.enter();
  const data = `Data from ${threadId}`.repeat(REPEAT_COUNT);
  fs.writeFile(file, data, () => {
    fs.unlink(file, () => {
      semaphore.leave();
    });
  });
}
