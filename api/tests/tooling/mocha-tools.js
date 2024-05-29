import Runnable from 'mocha/lib/runnable.js';

const superRun = Runnable.prototype.run;
let mochaContext;

Runnable.prototype.run = function (...args) {
  mochaContext = this;
  return superRun.bind(this)(...args);
};

/**
 * Dirty hack to allow to increase the timeout of the current mocha test
 * without having the current this context.
 * @param timeIncrement the increment to the timeout in ms.
 */
export const increaseCurrentTestTimeout = (timeIncrement) => {
  if (mochaContext) {
    mochaContext.timeout(mochaContext._timeout + timeIncrement);
  }
};
