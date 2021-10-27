import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | CampaignParticipationBadge', function () {
  setupTest();

  let store;

  beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  it('exists', function () {
    const badge = store.createRecord('campaign-participation-badge');

    expect(badge).to.be.ok;
  });

  describe('#maxTotalSkillsCountInSkillSets', function () {
    it('should calculate max total skills', function () {
      const skillSetResult1 = store.createRecord('skill-set-result', {
        totalSkillsCount: 2,
      });
      const skillSetResult2 = store.createRecord('skill-set-result', {
        totalSkillsCount: 10,
      });

      const model = store.createRecord('campaign-participation-badge');
      model.skillSetResults = [skillSetResult1, skillSetResult2];

      // when
      const maxTotalSkillsCountInSkillSets = model.maxTotalSkillsCountInSkillSets;

      // then
      expect(maxTotalSkillsCountInSkillSets).to.equal(10);
    });
  });
});
