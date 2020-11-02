import { run } from '@ember/runloop';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | Profile model', function() {
  setupTest();

  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  it('exists', function() {
    const model = store.createRecord('profile');
    expect(model).to.be.ok;
  });

  describe('@areasCode', () => {

    it('should return an array of unique areas code', function() {
      return run(() => {
        // given
        const area1 = store.createRecord('area', { code: 1 });
        const area2 = store.createRecord('area', { code: 2 });

        const scorecard1 = store.createRecord('scorecard', { area: area1 });
        const scorecard2 = store.createRecord('scorecard', { area: area1 });
        const scorecard3 = store.createRecord('scorecard', { area: area2 });

        const model = store.createRecord('profile');
        model.set('scorecards', [scorecard1, scorecard2, scorecard3]);

        // when
        const areasCode = model.get('areasCode');

        // then
        expect(areasCode).to.deep.equal([1, 2]);
      });
    });
  });
});
