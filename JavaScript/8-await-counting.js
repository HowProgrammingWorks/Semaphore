'use strict';

const fs = require('fs');

class CountingSemaphore {
  constructor(concurrency) {
    this.counter = concurrency;
    this.queue = [];
  }

  enter() {
    return new Promise((resolve) => {
      if (this.counter > 0) {
        this.counter--;
        resolve();
        return;
      }
      this.queue.push(resolve);
    });
  }

  leave() {
    if (this.queue.length === 0) {
      this.counter++;
      return;
    }
    const resolve = this.queue.shift();
    resolve();
  }
}

// Usage

const job = async (task) => {
  console.log('try enter', task);
  await semaphore.enter();
  console.log('enter', task);
  setTimeout(() => {
    semaphore.leave();
    console.log('leave', task);
  }, 1000);
};

const semaphore = new CountingSemaphore(3);
for (let i = 0; i < 100; i++) job(i);
