import { expect } from 'chai';
import { describeModel, it } from 'ember-mocha';

describeModel(
  'challenge',
  'Unit | Model | Challenge',
  {
    needs: ['model:course']
  },
  function () {
    it('exists', function () {
      let model = this.subject();
      expect(model).to.be.ok;
    });
  }
);
