import Ember from 'ember';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | Answer', function () {

  setupModelTest('answer', {
    needs: ['model:assessment', 'model:challenge']
  });

  it('exists', function () {
    const model = this.subject();
    // var store = this.store();
    expect(model).to.be.ok;
  });

  describe('isResultOk', function () {

    it('should return bool', function () {
      Ember.run(() => {
        // given
        const store = this.store();
        const answer = store.createRecord('answer', { 'result': 'ok' });

        expect(answer.get('isResultOk')).to.equal(true);
      });
    });
  });
});
