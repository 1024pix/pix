import { run } from '@ember/runloop';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | snapshot', function() {
  setupTest();

  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  it('exists', function() {
    const model = store.createRecord('snapshot');
    expect(model).to.be.ok;
  });

  describe('@numberOfTestsFinished', function() {
    it('should return the number of finished test', function() {
      return run(() => {
        // given
        const model = store.createRecord('snapshot');
        const testsFinished = 5;
        model.set('testsFinished', testsFinished);
        // when
        const numberOfFinishedTests = model.get('numberOfTestsFinished');
        // then
        expect(numberOfFinishedTests).to.equal(testsFinished);
      });
    });

    it('should return 0 if the model do not have the number of finished test', function() {
      return run(() => {
        // given
        const model = store.createRecord('snapshot');
        // when
        const numberOfFinishedTests = model.get('numberOfTestsFinished');
        // then
        expect(numberOfFinishedTests).to.equal(0);
      });
    });
  });
});
