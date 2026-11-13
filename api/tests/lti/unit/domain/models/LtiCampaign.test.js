import { expect } from 'chai';

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
              tag: 'pix-campaign-123',
              resourceLinkId: '123456',
            },
            {
              label: 'ABCD12345 : 1.2 Gérer des données',
              resourceId: 'pix:campaign:123:competence:recCompetence2',
              scoreMaximum: 5,
              tag: 'pix-campaign-123',
              resourceLinkId: '123456',
            },
            {
              label: 'ABCD12345 : Taux de réussite',
              resourceId: 'pix:campaign:123:mastery-rate',
              scoreMaximum: 100,
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
            tag: 'pix-campaign-123',
            resourceLinkId: '123456',
          },
          {
            label: 'ABCD12345 : 1.2 Gérer des données',
            resourceId: 'pix:campaign:123:competence:recCompetence2',
            scoreMaximum: 5,
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
});
