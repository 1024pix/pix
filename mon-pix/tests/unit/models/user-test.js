import { run } from '@ember/runloop';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | user model', function() {
  setupModelTest('user', {
    needs: ['model:competence', 'model:organization', 'model:scorecard', 'model:area']
  });

  it('exists', function() {
    const model = this.subject();
    expect(model).to.be.ok;
  });

  describe('@fullName', () => {
    it('should concatenate user first and last name', function() {
      return run(() => {
        // given
        const model = this.subject();
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
        const store = this.store();
        const area1 = store.createRecord('area', { code: 1 });
        const area2 = store.createRecord('area', { code: 2 });

        const scorecard1 = store.createRecord('scorecard', { area: area1 });
        const scorecard2 = store.createRecord('scorecard', { area: area1 });
        const scorecard3 = store.createRecord('scorecard', { area: area2 });

        const model = this.subject();
        model.set('scorecards', [scorecard1, scorecard2, scorecard3]);

        // when
        const areasCode = model.get('areasCode');

        // then
        expect(areasCode).to.deep.equal([1, 2]);
      });
    });
  });
});
