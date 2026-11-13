import { expect } from 'chai';

import { CampaignAssessmentResult } from '../../../../../src/lti/domain/models/CampaignAssessmentResult.js';
import { LtiCampaign } from '../../../../../src/lti/domain/models/LtiCampaign.js';

describe('Unit | LTI | Domain | Model | LtiCampaign', function () {
  const i18n = {
    __: (key) =>
      ({
        'lti.line-item-mastery-rate': 'Taux de réussite',
        'lti.line-item-pix-score': 'Score Pix global',
      })[key],
  };

  function buildLtiCampaign({ type = 'ASSESSMENT', competences } = {}) {
    return new LtiCampaign({
      id: 123,
      code: 'ABCD12345',
      name: 'Campagne',
      type,
      competences,
    });
  }

  describe('#constructor', function () {
    it('defaults competences to an empty array', function () {
      // when
      const campaign = buildLtiCampaign();

      // then
      expect(campaign.competences).to.deep.equal([]);
    });

    it('defaults mastery rate to null', function () {
      // when
      const campaign = buildLtiCampaign();

      // then
      expect(campaign.masteryRate).to.be.null;
    });

    it('keeps the given competences', function () {
      // given
      const competences = [{ id: 'recCompetence1', index: '1.1', name: 'Mener une recherche', maxLevel: 3 }];

      // when
      const campaign = buildLtiCampaign({ competences });

      // then
      expect(campaign.competences).to.equal(competences);
    });
  });

  describe('#lineItemTag', function () {
    it('returns a tag built from the campaign id', function () {
      // when
      const campaign = buildLtiCampaign();

      // then
      expect(campaign.lineItemTag).to.equal('pix-campaign-123');
    });
  });

  describe('#buildLineItems', function () {
    const competences = [
      { id: 'recCompetence1', index: '1.1', name: 'Mener une recherche', maxLevel: 3.4 },
      { id: 'recCompetence2', index: '1.2', name: 'Gérer des données', maxLevel: 5 },
    ];
    const resourceLinkId = '123456';

    ['ASSESSMENT', 'EXAM'].forEach((type) => {
      context(`when campaign type is ${type}`, function () {
        it('returns a line item per competence followed by a mastery rate line item', function () {
          // given
          const campaign = buildLtiCampaign({ type, competences });

          // when
          const lineItems = campaign.buildLineItems(resourceLinkId, i18n);

          // then
          expect(lineItems).to.deep.equal([
            {
              label: 'ABCD12345 : 1.1 Mener une recherche',
              resourceId: 'pix:campaign:123:competence:recCompetence1',
              scoreMaximum: 3,
              scoreGiven: null,
              tag: 'pix-campaign-123',
              resourceLinkId: '123456',
            },
            {
              label: 'ABCD12345 : 1.2 Gérer des données',
              resourceId: 'pix:campaign:123:competence:recCompetence2',
              scoreMaximum: 5,
              scoreGiven: null,
              tag: 'pix-campaign-123',
              resourceLinkId: '123456',
            },
            {
              label: 'ABCD12345 : Taux de réussite',
              resourceId: 'pix:campaign:123:mastery-rate',
              scoreMaximum: 100,
              scoreGiven: null,
              tag: 'pix-campaign-123',
              resourceLinkId: '123456',
            },
          ]);
        });
      });
    });

    context('when campaign type is PROFILES_COLLECTION', function () {
      it('returns a global Pix score line item', function () {
        // given
        const campaign = buildLtiCampaign({ type: 'PROFILES_COLLECTION', competences });

        // when
        const lineItems = campaign.buildLineItems(resourceLinkId, i18n);

        // then
        expect(lineItems).to.deep.equal([
          {
            label: 'ABCD12345 : 1.1 Mener une recherche',
            resourceId: 'pix:campaign:123:competence:recCompetence1',
            scoreMaximum: 3,
            scoreGiven: null,
            tag: 'pix-campaign-123',
            resourceLinkId: '123456',
          },
          {
            label: 'ABCD12345 : 1.2 Gérer des données',
            resourceId: 'pix:campaign:123:competence:recCompetence2',
            scoreMaximum: 5,
            scoreGiven: null,
            tag: 'pix-campaign-123',
            resourceLinkId: '123456',
          },
          {
            label: 'ABCD12345 : Score Pix global',
            resourceId: 'pix:campaign:123:pix-score',
            scoreMaximum: 1024,
            tag: 'pix-campaign-123',
            resourceLinkId: '123456',
          },
        ]);
      });
    });

    context('when campaign type is unknown', function () {
      it('returns only the competence line items', function () {
        // given
        const campaign = buildLtiCampaign({ type: 'UNKNOWN', competences });

        // when
        const lineItems = campaign.buildLineItems(resourceLinkId, i18n);

        // then
        expect(lineItems.map(({ resourceId }) => resourceId)).to.deep.equal([
          'pix:campaign:123:competence:recCompetence1',
          'pix:campaign:123:competence:recCompetence2',
        ]);
      });

      it('returns an empty array when there is no competence either', function () {
        // given
        const campaign = buildLtiCampaign({ type: 'UNKNOWN' });

        // when
        const lineItems = campaign.buildLineItems(resourceLinkId, i18n);

        // then
        expect(lineItems).to.deep.equal([]);
      });
    });
  });

  describe('#populateScore', function () {
    const competences = [
      { id: 'recCompetence1', index: '1.1', name: 'Mener une recherche', maxLevel: 3 },
      { id: 'recCompetence2', index: '1.2', name: 'Gérer des données', maxLevel: 5 },
    ];

    it('sets the reached level on each competence and the mastery rate', function () {
      // given
      const campaign = buildLtiCampaign({ competences });
      const campaignAssessmentResult = new CampaignAssessmentResult({
        campaignParticipationId: 1,
        masteryRate: 0.42,
        competences: [
          { id: 'recCompetence2', index: '1.2', name: 'Gérer des données', maxLevel: 5, reachedLevel: 0 },
          { id: 'recCompetence1', index: '1.1', name: 'Mener une recherche', maxLevel: 3, reachedLevel: 2 },
        ],
      });

      // when
      campaign.populateScore(campaignAssessmentResult);

      // then
      expect(campaign.masteryRate).to.equal(0.42);
      expect(campaign.competences).to.deep.equal([
        { id: 'recCompetence1', index: '1.1', name: 'Mener une recherche', maxLevel: 3, reachedLevel: 2 },
        { id: 'recCompetence2', index: '1.2', name: 'Gérer des données', maxLevel: 5, reachedLevel: 0 },
      ]);
    });

    it('does not set a reached level on competences missing from the result', function () {
      // given
      const campaign = buildLtiCampaign({ competences });
      const campaignAssessmentResult = new CampaignAssessmentResult({
        campaignParticipationId: 1,
        competences: [
          { id: 'recCompetence1', index: '1.1', name: 'Mener une recherche', maxLevel: 3, reachedLevel: 2 },
          { id: 'recUnknown', index: '9.9', name: 'Hors campagne', maxLevel: 1, reachedLevel: 1 },
        ],
      });

      // when
      campaign.populateScore(campaignAssessmentResult);

      // then
      expect(campaign.masteryRate).to.be.null;
      expect(campaign.competences).to.deep.equal([
        { id: 'recCompetence1', index: '1.1', name: 'Mener une recherche', maxLevel: 3, reachedLevel: 2 },
        { id: 'recCompetence2', index: '1.2', name: 'Gérer des données', maxLevel: 5 },
      ]);
    });

    it('does not mutate the given competences', function () {
      // given
      const givenCompetences = [{ id: 'recCompetence1', index: '1.1', name: 'Mener une recherche', maxLevel: 3 }];
      const campaign = buildLtiCampaign({ competences: givenCompetences });

      // when
      campaign.populateScore(
        new CampaignAssessmentResult({
          campaignParticipationId: 1,
          competences: [{ id: 'recCompetence1', reachedLevel: 2 }],
        }),
      );

      // then
      expect(givenCompetences[0]).not.to.have.property('reachedLevel');
    });
  });

  describe('#buildLineItems with a populated score', function () {
    const resourceLinkId = '123456';
    const competences = [
      { id: 'recCompetence1', index: '1.1', name: 'Mener une recherche', maxLevel: 3.4 },
      { id: 'recCompetence2', index: '1.2', name: 'Gérer des données', maxLevel: 5 },
    ];

    ['ASSESSMENT', 'EXAM'].forEach((type) => {
      context(`when campaign type is ${type}`, function () {
        it('adds the reached level as scoreGiven on competence line items and the mastery rate on the global one', function () {
          // given
          const campaign = buildLtiCampaign({ type, competences });
          campaign.populateScore(
            new CampaignAssessmentResult({
              campaignParticipationId: 1,
              masteryRate: 0.57,
              competences: [
                { id: 'recCompetence1', reachedLevel: 1.6666 },
                { id: 'recCompetence2', reachedLevel: 0 },
              ],
            }),
          );

          // when
          const lineItems = campaign.buildLineItems(resourceLinkId, i18n);

          // then
          expect(lineItems).to.deep.equal([
            {
              label: 'ABCD12345 : 1.1 Mener une recherche',
              resourceId: 'pix:campaign:123:competence:recCompetence1',
              scoreMaximum: 3,
              scoreGiven: 1.7,
              tag: 'pix-campaign-123',
              resourceLinkId: '123456',
            },
            {
              label: 'ABCD12345 : 1.2 Gérer des données',
              resourceId: 'pix:campaign:123:competence:recCompetence2',
              scoreMaximum: 5,
              scoreGiven: 0,
              tag: 'pix-campaign-123',
              resourceLinkId: '123456',
            },
            {
              label: 'ABCD12345 : Taux de réussite',
              resourceId: 'pix:campaign:123:mastery-rate',
              scoreMaximum: 100,
              scoreGiven: 57,
              tag: 'pix-campaign-123',
              resourceLinkId: '123456',
            },
          ]);
        });
      });
    });

    it('does not add scoreGiven on the Pix score line item of a PROFILES_COLLECTION campaign', function () {
      // given
      const campaign = buildLtiCampaign({ type: 'PROFILES_COLLECTION', competences });
      campaign.populateScore(
        new CampaignAssessmentResult({ campaignParticipationId: 1, masteryRate: 0.5, competences: [] }),
      );

      // when
      const lineItems = campaign.buildLineItems(resourceLinkId, i18n);

      // then
      expect(lineItems[2].resourceId).to.equal('pix:campaign:123:pix-score');
      expect(lineItems[2]).not.to.have.property('scoreGiven');
    });
  });
});
