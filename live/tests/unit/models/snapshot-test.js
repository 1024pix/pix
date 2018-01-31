import { run } from '@ember/runloop';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | snapshot', function() {
  setupModelTest('snapshot', {
    // Specify the other units that are required for this test.
    needs: ['model:organization']
  });

  // Replace this with your real tests.
  it('exists', function() {
    const model = this.subject();
    // var store = this.store();
    expect(model).to.be.ok;
  });

  describe('@numberOfTestsFinished', function() {
    it('should return the number of finished test', function() {
      return run(() => {
        // given
        const model = this.subject();
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
        const model = this.subject();
        // when
        const numberOfFinishedTests = model.get('numberOfTestsFinished');
        // then
        expect(numberOfFinishedTests).to.equal(0);
      });
    });
  });
});
