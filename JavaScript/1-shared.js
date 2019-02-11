'use strict';

const threads = require('worker_threads');
const { Worker, isMainThread } = threads;

if (isMainThread) {
  const buffer = new SharedArrayBuffer(10);
  new Worker(__filename, { workerData: buffer });
  new Worker(__filename, { workerData: buffer });
} else {
  const { threadId, workerData } = threads;
  const array = new Int8Array(workerData);
  const value = threadId === 1 ? 1 : -1;
  setInterval(() => {
    for (let i = 0; i < 10; i++) {
      array[i] = value;
      for (let j = 0; j < 1000000; j++) j;
    }
    console.dir([ threadId, array ]);
  }, 100);
}
