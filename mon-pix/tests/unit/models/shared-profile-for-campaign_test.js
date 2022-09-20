import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | SharedProfileForCampaign model', function () {
  let store;

  setupTest();

  beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  it('should return an array of unique areas', function () {
    // given
    const area1 = store.createRecord('area', { code: 1 });
    const area2 = store.createRecord('area', { code: 2 });

    const scorecard1 = store.createRecord('scorecard', { area: area1 });
    const scorecard2 = store.createRecord('scorecard', { area: area1 });
    const scorecard3 = store.createRecord('scorecard', { area: area2 });

    const model = store.createRecord('sharedProfileForCampaign');
    model.scorecards = [scorecard1, scorecard2, scorecard3];

    // when
    const areas = model.areas;

    // then
    expect(areas.map((area) => area.get('code'))).to.deep.equal([1, 2]);
  });
});
