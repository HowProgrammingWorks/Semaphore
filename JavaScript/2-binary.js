'use strict';

const threads = require('worker_threads');
const { Worker, isMainThread } = threads;

class BinarySemaphore {
  constructor(shared, offset = 0) {
    this.lock = new Int8Array(shared, offset, 1);
  }

  enter() {
    while (this.lock[0] !== 0);
    this.lock[0] = 1;
  }

  leave() {
    if (this.lock[0] === 0) return;
    this.lock[0] = 0;
  }
}

// Usage

if (isMainThread) {
  const buffer = new SharedArrayBuffer(11);
  const semaphore = new BinarySemaphore(buffer);
  console.dir({ semaphore });
  new Worker(__filename, { workerData: buffer });
  new Worker(__filename, { workerData: buffer });
} else {
  const { threadId, workerData } = threads;
  const semaphore = new BinarySemaphore(workerData);
  const array = new Int8Array(workerData, 1);
  const value = threadId === 1 ? 1 : -1;
  setInterval(() => {
    semaphore.enter();
    for (let i = 0; i < 10; i++) {
      array[i] = value;
      for (let j = 0; j < 1000000; j++) j;
    }
    console.dir([ threadId, array ]);
    semaphore.leave();
  }, 100);
}
