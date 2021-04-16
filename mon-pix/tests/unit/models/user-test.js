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

  describe('#fullName', () => {
    it('should concatenate user first and last name', function() {
      // given
      const model = store.createRecord('user');
      model.set('firstName', 'Manu');
      model.set('lastName', 'Phillip');

      // when
      const fullName = model.fullName;

      // then
      expect(fullName).to.equal('Manu Phillip');
    });
  });

  describe('#hasAssessmentParticipations', () => {
    it('should return true if the user has at least one participation', function() {
      // given
      const campaign = store.createRecord('campaign', { type: 'ASSESSMENT' });
      const participation = store.createRecord('campaign-participation');
      participation.set('campaign', campaign);
      const model = store.createRecord('user');
      model.set('campaignParticipations', [participation]);

      // when
      const hasAssessmentParticipations = model.hasAssessmentParticipations;

      // then
      expect(hasAssessmentParticipations).to.equal(true);
    });

    it('should return false if the user has no assessment participation', function() {
      // given
      const campaign = store.createRecord('campaign', { type: 'PROFILE_COLLECTION' });
      const participation = store.createRecord('campaign-participation');
      participation.set('campaign', campaign);
      const model = store.createRecord('user');
      model.set('campaignParticipations', [participation]);

      // when
      const hasAssessmentParticipations = model.hasAssessmentParticipations;

      // then
      expect(hasAssessmentParticipations).to.equal(false);
    });

    it('should return false if the user has no participation', function() {
      // given
      const model = store.createRecord('user');

      // when
      const hasAssessmentParticipations = model.hasAssessmentParticipations;

      // then
      expect(hasAssessmentParticipations).to.equal(false);
    });
  });
});
