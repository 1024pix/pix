import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | Dashboard | Content', function() {
  let component;

  setupTest();

  beforeEach(function() {
    // given
    component = createGlimmerComponent('component:dashboard/content');
  });

  describe('#recommendedScorecards', function() {

    it('should return non-started scorecards', function() {
      // given
      const scorecards = [
        { id: 1, isNotStarted: true },
        { id: 2, isNotStarted: true },
        { id: 4, isNotStarted: true },
        { id: 5, isNotStarted: false },
        { id: 3, isNotStarted: true },
      ];

      const expectedScorecards = [
        { id: 1, isNotStarted: true },
        { id: 2, isNotStarted: true },
        { id: 4, isNotStarted: true },
        { id: 3, isNotStarted: true },
      ];

      component.args.model = { scorecards };

      // when
      const result = component.recommendedScorecards;

      // then
      expect(result).to.deep.equal(expectedScorecards);
    });

    it('should return scorecards ordered by index', function() {
      // given
      const scorecards = [
        { id: 3, index: '3.1', isNotStarted: true },
        { id: 1, index: '1.1', isNotStarted: true },
        { id: 4, index: '2.4', isNotStarted: true },
      ];

      const expectedScorecards = [
        { id: 1, index: '1.1', isNotStarted: true },
        { id: 4, index: '2.4', isNotStarted: true },
        { id: 3, index: '3.1', isNotStarted: true },
      ];

      component.args.model = { scorecards };

      // when
      const result = component.recommendedScorecards;

      // then
      expect(result).to.deep.equal(expectedScorecards);
    });

    it('should return a maximum of four cards', function() {
      // given
      const scorecards = [
        { id: 1, isNotStarted: true },
        { id: 2, isNotStarted: true },
        { id: 4, isNotStarted: true },
        { id: 5, isNotStarted: true },
        { id: 3, isNotStarted: true },
      ];

      const expectedScorecards = [
        { id: 1, isNotStarted: true },
        { id: 2, isNotStarted: true },
        { id: 4, isNotStarted: true },
        { id: 5, isNotStarted: true },
      ];

      component.args.model = EmberObject.create({ scorecards });

      // when
      const result = component.recommendedScorecards;

      // then
      expect(result).to.deep.equal(expectedScorecards);
    });

  });

  describe('#startedCompetences', function() {

    it('should return started competences', function() {
      // given
      const scorecards = [
        { id: 1, isStarted: true },
        { id: 2, isStarted: true },
        { id: 4, isStarted: true },
        { id: 5, isStarted: false },
        { id: 3, isStarted: true },
      ];

      const expectedScorecards = [
        { id: 1, isStarted: true },
        { id: 2, isStarted: true },
        { id: 4, isStarted: true },
        { id: 3, isStarted: true },
      ];

      component.args.model = { scorecards };

      // when
      const result = component.startedCompetences;

      // then
      expect(result).to.deep.equal(expectedScorecards);
    });

    it('should return scorecards ordered by index', function() {
      // given
      const scorecards = [
        { id: 3, index: '3.1', isStarted: true },
        { id: 1, index: '1.1', isStarted: true },
        { id: 4, index: '2.4', isStarted: true },
      ];

      const expectedScorecards = [
        { id: 1, index: '1.1', isStarted: true },
        { id: 4, index: '2.4', isStarted: true },
        { id: 3, index: '3.1', isStarted: true },
      ];

      component.args.model = { scorecards };

      // when
      const result = component.startedCompetences;

      // then
      expect(result).to.deep.equal(expectedScorecards);
    });

    it('should return a maximum of four cards', function() {
      // given
      const scorecards = [
        { id: 1, isStarted: true },
        { id: 2, isStarted: true },
        { id: 4, isStarted: true },
        { id: 5, isStarted: true },
        { id: 3, isStarted: true },
      ];

      const expectedScorecards = [
        { id: 1, isStarted: true },
        { id: 2, isStarted: true },
        { id: 4, isStarted: true },
        { id: 5, isStarted: true },
      ];

      component.args.model = EmberObject.create({ scorecards });

      // when
      const result = component.startedCompetences;

      // then
      expect(result).to.deep.equal(expectedScorecards);
    });
  });

  describe('#userFirstname', function() {
    it('should return userFirstname', function() {
      // given
      const userFirstName = 'user firstname';
      component.currentUser = EmberObject.create({ user: { firstName: userFirstName } });

      // when
      const result = component.userFirstname;

      // then
      expect(result).to.equal(userFirstName);
    });
  });

  describe('#hasNothingToShow', function() {
    it('should return true when there is nothing to show', function() {
      // given
      const scorecards = [
        { id: 1, isNotStarted: false, isStarted: false },
        { id: 2, isNotStarted: false, isStarted: false },
        { id: 4, isNotStarted: false, isStarted: false },
        { id: 5, isNotStarted: false, isStarted: false },
        { id: 3, isNotStarted: false, isStarted: false },
      ];

      component.args.model = { scorecards, campaignParticipationOverviews: [] };

      // when
      const result = component.hasNothingToShow;

      // then
      expect(result).to.be.true;
    });

    it('should return false when there is one competence started', function() {
      // given
      const scorecards = [
        { id: 1, isNotStarted: false, isStarted: true },
        { id: 2, isNotStarted: false, isStarted: false },
        { id: 4, isNotStarted: false, isStarted: false },
        { id: 5, isNotStarted: false, isStarted: false },
        { id: 3, isNotStarted: false, isStarted: false },
      ];

      component.args.model = { scorecards, campaignParticipationOverviews: [] };

      // when
      const result = component.hasNothingToShow;

      // then
      expect(result).to.be.false;
    });

    it('should return false when there is one competence not started', function() {
      // given
      const scorecards = [
        { id: 1, isNotStarted: false, isStarted: false },
        { id: 2, isNotStarted: true, isStarted: false },
        { id: 4, isNotStarted: false, isStarted: false },
        { id: 5, isNotStarted: false, isStarted: false },
        { id: 3, isNotStarted: false, isStarted: false },
      ];

      component.args.model = { scorecards, campaignParticipationOverviews: [] };

      // when
      const result = component.hasNothingToShow;

      // then
      expect(result).to.be.false;
    });

    it('should return false when there is one campaign participation', function() {
      // given
      const scorecards = [
        { id: 1, isNotStarted: false, isStarted: false },
        { id: 2, isNotStarted: false, isStarted: false },
        { id: 4, isNotStarted: false, isStarted: false },
        { id: 5, isNotStarted: false, isStarted: false },
        { id: 3, isNotStarted: false, isStarted: false },
      ];
      const campaignParticipationOverviews = [
        { id: 1 },
      ];

      component.args.model = { scorecards, campaignParticipationOverviews };

      // when
      const result = component.hasNothingToShow;

      // then
      expect(result).to.be.false;
    });

  });

  describe('#userScore', function() {
    it('should return user score', function() {
      // given
      const pixScore = '68';
      component.currentUser = EmberObject.create({ user: { profile: { pixScore } } });

      // when
      const result = component.userScore;

      // then
      expect(result).to.equal(pixScore);
    });
  });

  describe('#profileCollectionCampaignParticipationCode', function() {
    it('should return the most recent profile collection campaign participation code among the unfinished ones', function() {
      // given
      const campaignNotFinished = EmberObject.create({
        isShared: false,
        createdAt: '2018-01-01',
        campaign: EmberObject.create({
          code: 'AZERTY0',
          isProfilesCollection: true,
        }),
      });
      const oldCampaignNotFinished = EmberObject.create({
        isShared: false,
        createdAt: '2017-01-01',
        campaign: EmberObject.create({
          code: 'AZERTY1',
          isProfilesCollection: true,
        }),
      });
      const campaignParticipations = [oldCampaignNotFinished, campaignNotFinished];
      component.args.model = { campaignParticipations };

      const expectedResult = campaignNotFinished.campaign.code;

      // when
      const campaignParticipationCode = component.profileCollectionCampaignParticipationCode;

      // then
      expect(campaignParticipationCode).to.equal(expectedResult);
    });

    it('should return null when all campaign are finished', function() {
      // given
      const campaignFinished = EmberObject.create({
        isShared: true,
        createdAt: '2018-12-12',
        campaign: EmberObject.create({
          code: 'AZERTY2',
          isProfilesCollection: true,
        }),
      });
      const campaignParticipations = [campaignFinished];
      component.args.model = { campaignParticipations };

      // when
      const campaignParticipationCode = component.profileCollectionCampaignParticipationCode;

      // then
      expect(campaignParticipationCode).to.equal(null);
    });
  });
});
