import { run } from '@ember/runloop';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

const SMART_PLACEMENT_TYPE = 'SMART_PLACEMENT';

describe('Unit | Model | Assessment', function() {

  setupModelTest('assessment', {
    needs: ['model:course', 'model:challenge', 'model:answer', 'model:assessment-result']
  });

  it('exists', function() {
    const model = this.subject();
    expect(model).to.be.ok;
  });

  describe('Computed property #hasCheckpoints', function() {

    it('Should be true when challenge is a SMART_PLACEMENT', function() {
      run(() => {
        // given
        const store = this.store();
        const assessment = store.createRecord('assessment', { type: SMART_PLACEMENT_TYPE });

        // when
        const hasCheckpoints = assessment.get('hasCheckpoints');

        // then
        expect(hasCheckpoints).to.be.true;
      });
    });

    it('Should be true when challenge is NOT a SMART_PLACEMENT', function() {
      run(() => {
        // given
        const assessment = this.subject();
        assessment.set('type', 'DEMO');

        // when
        const hasCheckpoints = assessment.get('hasCheckpoints');

        // then
        expect(hasCheckpoints).to.be.false;
      });
    });

  });

  describe('on ready event', function() {
    it('should instanciate an assessment progression behavior', function() {
      run(() => {
        const store = this.store();
        // when
        const assessment = store.createRecord('assessment');
        // then
        expect(assessment.get('progressionBehavior')).to.be.ok;
      });
    });
  });
});
