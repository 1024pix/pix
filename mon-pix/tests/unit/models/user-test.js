import { run } from '@ember/runloop';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | user model', function() {
  setupTest();

  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  it('exists', function() {
    const model = store.createRecord('user');
    expect(model).to.be.ok;
  });

  describe('@fullName', () => {
    it('should concatenate user first and last name', function() {
      return run(() => {
        // given
        const model = store.createRecord('user');
        model.set('firstName', 'Manu');
        model.set('lastName', 'Phillip');

        // when
        const fullName = model.get('fullName');

        // then
        expect(fullName).to.equal('Manu Phillip');
      });
    });
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

        const model = store.createRecord('user');
        model.set('scorecards', [scorecard1, scorecard2, scorecard3]);

        // when
        const areasCode = model.get('areasCode');

        // then
        expect(areasCode).to.deep.equal([1, 2]);
      });
    });
  });

  describe('@pixScore', () => {

    it('should return the sum of earnedPix in Scorecard', function() {
      return run(() => {
        // given
        const scorecard1 = store.createRecord('scorecard', { earnedPix: 5 });
        const scorecard2 = store.createRecord('scorecard', { earnedPix: 10 });
        const scorecard3 = store.createRecord('scorecard', { earnedPix: 2 });

        const model = store.createRecord('user');
        model.set('scorecards', [scorecard1, scorecard2, scorecard3]);

        // when
        const pixScore = model.get('pixScore');

        // then
        expect(pixScore).to.equal(17);
      });
    });
  });

});
