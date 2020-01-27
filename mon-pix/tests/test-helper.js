import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { mocha } from 'mocha';
import start from 'ember-exam/test-support/start';

mocha.setup({
  // If a test is randomly killed by the timeout duration,
  // consider this before increasing the timeout:
  //
  // - Computers are fast. 1,5s is a long time, even for an acceptance test.
  //   Why is this test so slow?
  //
  // - Can you make the test faster, rather than increasing the timeout?
  //
  // - The acceptance test runner waits for all network requests, delayed actions,
  //   run-loop delays and Promises to be revolved before continuing to the next step.
  //   Is any code triggering an artifical delay in tests – like `setTimeout` or `Ember.run.later`?
  timeout: 1500,
  slow: 500,
});

setApplication(Application.create(config.APP));
start();
