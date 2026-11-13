import { expect } from 'chai';
import nock from 'nock';

import { LtiLineItemsInitializationError } from '../../../../../src/lti/domain/errors.js';
import { LtiCampaign } from '../../../../../src/lti/domain/models/LtiCampaign.js';
import { ltiScoringService } from '../../../../../src/lti/domain/services/lti.scoring.service.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | LTI | Domain | Services | LTI Scoring', function () {
  describe('initializeLineItems', function () {
    const platformOrigin = 'https://moodle.example.net';
    const lineItemsUrl = `${platformOrigin}/mod/lti/services.php/2/lineitems?type_id=3`;
    const accessToken = { token_type: 'Bearer', access_token: 'platform-access-token' };
    const resourceLinkId = '123456';

    const competence1LineItem = {
      label: 'ABCD12345 : 1.1 Mener une recherche',
      resourceId: 'pix:campaign:123:competence:recCompetence1',
      scoreMaximum: 3,
      scoreGiven: null,
      tag: 'pix-campaign-123',
      resourceLinkId: '123456',
    };
    const competence2LineItem = {
      label: 'ABCD12345 : 1.2 Gérer des données',
      resourceId: 'pix:campaign:123:competence:recCompetence2',
      scoreMaximum: 5,
      scoreGiven: null,
      tag: 'pix-campaign-123',
      resourceLinkId: '123456',
    };
    const masteryRateLineItem = {
      label: 'ABCD12345 : Taux de réussite',
      resourceId: 'pix:campaign:123:mastery-rate',
      scoreMaximum: 100,
      scoreGiven: null,
      tag: 'pix-campaign-123',
      resourceLinkId: '123456',
    };
    const pixScoreLineItem = {
      label: 'ABCD12345 : Score Pix global',
      resourceId: 'pix:campaign:123:pix-score',
      scoreMaximum: 1024,
      tag: 'pix-campaign-123',
      resourceLinkId: '123456',
    };

    function buildCampaign({ type = 'ASSESSMENT', competences } = {}) {
      return new LtiCampaign({
        id: 123,
        code: 'ABCD12345',
        name: 'Campagne',
        type,
        competences: competences ?? [
          { id: 'recCompetence1', index: '1.1', name: 'Mener une recherche', maxLevel: 3.4 },
          { id: 'recCompetence2', index: '1.2', name: 'Gérer des données', maxLevel: 5 },
        ],
      });
    }

    // Mocks the platform's line items listing: the platform already holds `existingLineItems`.
    function mockLineItemsListing({ existingLineItems = [], resourceLinkId } = {}) {
      return nock(platformOrigin, { reqheaders: { authorization: 'Bearer platform-access-token' } })
        .get('/mod/lti/services.php/2/lineitems')
        .query({ type_id: '3', resourceLinkId, tag: 'pix-campaign-123', limit: '1000' })
        .reply(200, existingLineItems);
    }

    // Mocks the creation of exactly `lineItem` on the platform: a POST with any other body gets no match and fails.
    // Use `scope.isDone()` to check whether this creation was requested.
    function mockLineItemCreation(lineItem, { status = 201 } = {}) {
      return nock(platformOrigin, {
        reqheaders: {
          authorization: 'Bearer platform-access-token',
          'content-type': 'application/vnd.ims.lis.v2.lineitem+json',
        },
      })
        .post('/mod/lti/services.php/2/lineitems', lineItem)
        .query({ type_id: '3' })
        .reply(status, {});
    }

    it('creates a line item per competence, then a mastery rate line item for an assessment campaign', async function () {
      // given
      mockLineItemsListing({ resourceLinkId });
      const competence1Creation = mockLineItemCreation(competence1LineItem);
      const competence2Creation = mockLineItemCreation(competence2LineItem);
      const masteryRateCreation = mockLineItemCreation(masteryRateLineItem);

      // when
      await ltiScoringService.initializeLineItems({
        lineItemsUrl,
        resourceLinkId,
        campaign: buildCampaign(),
        accessToken,
      });

      // then
      expect(competence1Creation.isDone()).to.be.true;
      expect(competence2Creation.isDone()).to.be.true;
      expect(masteryRateCreation.isDone()).to.be.true;
    });

    it('creates a global Pix score line item for a profiles collection campaign', async function () {
      // given
      mockLineItemsListing({ resourceLinkId });
      const competence1Creation = mockLineItemCreation(competence1LineItem);
      const competence2Creation = mockLineItemCreation(competence2LineItem);
      const pixScoreCreation = mockLineItemCreation(pixScoreLineItem);

      const campaign = buildCampaign({ type: 'PROFILES_COLLECTION' });

      // when
      await ltiScoringService.initializeLineItems({ lineItemsUrl, resourceLinkId, campaign, accessToken });

      // then
      expect(competence1Creation.isDone()).to.be.true;
      expect(competence2Creation.isDone()).to.be.true;
      expect(pixScoreCreation.isDone()).to.be.true;
    });

    it('does not create line items that already exist on the platform', async function () {
      // given
      mockLineItemsListing({
        resourceLinkId,
        existingLineItems: [
          { id: 'https://moodle.example.net/1', resourceId: competence1LineItem.resourceId },
          { id: 'https://moodle.example.net/3', resourceId: masteryRateLineItem.resourceId },
        ],
      });
      // only the missing line item is mocked: creating any other one would get no match and make the call fail
      const competence2Creation = mockLineItemCreation(competence2LineItem);

      // when
      await ltiScoringService.initializeLineItems({
        lineItemsUrl,
        resourceLinkId,
        campaign: buildCampaign(),
        accessToken,
      });

      // then
      expect(competence2Creation.isDone()).to.be.true;
    });

    it('creates nothing when every line item already exists', async function () {
      // given
      const listing = mockLineItemsListing({
        resourceLinkId,
        existingLineItems: [
          { resourceId: competence1LineItem.resourceId },
          { resourceId: competence2LineItem.resourceId },
          { resourceId: masteryRateLineItem.resourceId },
        ],
      });

      const competence1Creation = mockLineItemCreation(competence1LineItem);
      const competence2Creation = mockLineItemCreation(competence2LineItem);
      const masteryRateCreation = mockLineItemCreation(masteryRateLineItem);

      // when
      await ltiScoringService.initializeLineItems({
        lineItemsUrl,
        resourceLinkId,
        campaign: buildCampaign(),
        accessToken,
      });

      // then
      expect(listing.isDone()).to.be.true;
      expect(competence1Creation.isDone()).to.be.false;
      expect(competence2Creation.isDone()).to.be.false;
      expect(masteryRateCreation.isDone()).to.be.false;
    });

    describe('when the line items URL is missing', function () {
      it('throws a LtiLineItemsInitializationError', async function () {
        // when
        const error = await catchErr(ltiScoringService.initializeLineItems)({
          lineItemsUrl: undefined,
          resourceLinkId,
          campaign: buildCampaign(),
          accessToken,
        });

        // then
        expect(error).to.be.instanceOf(LtiLineItemsInitializationError);
      });
    });

    describe('when existing line items cannot be listed', function () {
      it('throws a LtiLineItemsInitializationError without creating anything', async function () {
        // given
        nock(platformOrigin).get('/mod/lti/services.php/2/lineitems').query(true).reply(500);
        const competence1Creation = mockLineItemCreation(competence1LineItem);

        // when
        const error = await catchErr(ltiScoringService.initializeLineItems)({
          lineItemsUrl,
          resourceLinkId,
          campaign: buildCampaign(),
          accessToken,
        });

        // then
        expect(error).to.be.instanceOf(LtiLineItemsInitializationError);
        expect(competence1Creation.isDone()).to.be.false;
      });
    });

    describe('when a line item cannot be created', function () {
      it('throws a LtiLineItemsInitializationError and stops creating line items', async function () {
        // given
        mockLineItemsListing({ resourceLinkId });
        const failingCompetence1Creation = mockLineItemCreation(competence1LineItem, { status: 500 });
        const competence2Creation = mockLineItemCreation(competence2LineItem);

        // when
        const error = await catchErr(ltiScoringService.initializeLineItems)({
          lineItemsUrl,
          resourceLinkId,
          campaign: buildCampaign(),
          accessToken,
        });

        // then
        expect(error).to.be.instanceOf(LtiLineItemsInitializationError);
        expect(failingCompetence1Creation.isDone()).to.be.true;
        expect(competence2Creation.isDone()).to.be.false;
      });
    });
  });
});
