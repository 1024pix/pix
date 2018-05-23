import { run } from '@ember/runloop';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | Assessment', function() {

  setupModelTest('assessment', {
    needs: ['model:course', 'model:answer']
  });

  it('exists', function() {
    const model = this.subject();
    expect(model).to.be.ok;
  });

  describe('Computed property #hasAttachment', function() {

    it('Should be true when challenge has at least one attachment file', function() {
      run(() => {
        // given
        const store = this.store();
        const assessment = store.createRecord('assessment', { type: 'SMART_PLACEMENT' });

        // when
        const hasCheckpoints = assessment.get('hasCheckpoints');

        // then
        expect(hasCheckpoints).to.be.true;
      });

    });

    it('Should be false when assessment has multiple attachment files', function() {
      run(() => {
        // given
        const store = this.store();
        const assessment = store.createRecord('assessment', { type: 'DEMO' });

        // when
        const hasCheckpoints = assessment.get('hasCheckpoints');

        // then
        expect(hasCheckpoints).to.be.false;
      });
    });

  });

});
