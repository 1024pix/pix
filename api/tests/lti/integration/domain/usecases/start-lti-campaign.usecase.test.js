import { expect } from 'chai';
import nock from 'nock';

import { LtiCampaignNotFoundError, LtiLineItemsInitializationError } from '../../../../../src/lti/domain/errors.js';
import { LtiCampaign } from '../../../../../src/lti/domain/models/LtiCampaign.js';
import { usecases } from '../../../../../src/lti/domain/usecases/index.js';
import { PIX_ORIGIN } from '../../../../../src/shared/constants.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | LTI | Domain | Usecases | startLtiCampaign', function () {
  const platformOrigin = 'https://moodle.example.net';
  const lineItemsUrl = `${platformOrigin}/mod/lti/services.php/2/lineitems?type_id=3`;
  const resourceLinkId = 'resource-link-id';
  const accessToken = { token_type: 'Bearer', access_token: 'platform-access-token', expires_in: 3600 };
  const platformUserSub = 'platform-user-sub';

  let campaignId;
  let clientId;
  let registration;

  beforeEach(async function () {
    const platformData = databaseBuilder.factory.buildLtiPlatform({ issuer: platformOrigin });
    const registrationData = databaseBuilder.factory.buildLtiPlatformRegistration({ platformId: platformData.id });
    clientId = registrationData.clientId;
    registration = domainBuilder.lti.buildLtiPlatformRegistration({
      ...registrationData,
      platform: domainBuilder.lti.buildLtiPlatform(platformData),
    });
    registration.platformOpenIdConfig = { token_endpoint: `${platformOrigin}/mod/lti/token.php` };
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    campaignId = databaseBuilder.factory.buildCampaign({
      code: 'ABCD12345',
      name: 'Campagne',
      type: 'ASSESSMENT',
      organizationId,
      targetProfileId,
    }).id;
    databaseBuilder.factory.learningContent.buildFramework({ id: 'recFramework1', name: PIX_ORIGIN });
    databaseBuilder.factory.learningContent.buildArea({
      id: 'recArea1',
      code: '1',
      frameworkId: 'recFramework1',
      competenceIds: ['recCompetence1'],
    });
    databaseBuilder.factory.learningContent.buildCompetence({
      id: 'recCompetence1',
      index: '1.1',
      name_i18n: { fr: 'Mener une recherche', en: 'Search' },
      origin: PIX_ORIGIN,
      areaId: 'recArea1',
    });
    databaseBuilder.factory.learningContent.buildThematic({
      id: 'recThematic1',
      competenceId: 'recCompetence1',
      tubeIds: ['recTube1'],
    });
    databaseBuilder.factory.learningContent.buildTube({
      id: 'recTube1',
      competenceId: 'recCompetence1',
      thematicId: 'recThematic1',
    });
    databaseBuilder.factory.learningContent.buildSkill({
      id: 'recSkill1',
      status: 'actif',
      level: 3,
      tubeId: 'recTube1',
    });
    databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkill1' });
    await databaseBuilder.commit();
  });

  function findLtiCampaignParticipations() {
    return knex('lti_campaign_participations').select(
      'clientId',
      'platformUserSub',
      'lineItemContainerUrl',
      'campaignId',
    );
  }

  function mockAccessTokenRequest({ status = 200, body = accessToken } = {}) {
    return nock(platformOrigin)
      .post('/mod/lti/token.php', ({ scope }) => scope === 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem')
      .reply(status, body);
  }

  function mockLineItemsListing({ status = 200, existingLineItems = [] } = {}) {
    return nock(platformOrigin, { reqheaders: { authorization: 'Bearer platform-access-token' } })
      .get('/mod/lti/services.php/2/lineitems')
      .query({ type_id: '3', resourceLinkId, tag: `pix-campaign-${campaignId}`, limit: '1000' })
      .reply(status, existingLineItems);
  }

  // A POST with any other body gets no match and fails: use `scope.isDone()` to check the creation was requested.
  function mockLineItemCreation(lineItem) {
    return nock(platformOrigin, {
      reqheaders: {
        authorization: 'Bearer platform-access-token',
        'content-type': 'application/vnd.ims.lis.v2.lineitem+json',
      },
    })
      .post('/mod/lti/services.php/2/lineitems', lineItem)
      .query({ type_id: '3' })
      .reply(201, {});
  }

  it('initializes the line items of the campaign on the platform, saves the participation and returns the campaign', async function () {
    // given
    mockAccessTokenRequest();
    mockLineItemsListing();
    const competenceLineItemCreation = mockLineItemCreation({
      label: 'ABCD12345 : 1.1 Mener une recherche',
      resourceId: `pix:campaign:${campaignId}:competence:recCompetence1`,
      scoreMaximum: 3,
      tag: `pix-campaign-${campaignId}`,
      resourceLinkId,
    });
    const masteryRateLineItemCreation = mockLineItemCreation({
      label: 'ABCD12345 : Taux de réussite',
      resourceId: `pix:campaign:${campaignId}:mastery-rate`,
      scoreMaximum: 100,
      tag: `pix-campaign-${campaignId}`,
      resourceLinkId,
    });

    // when
    const campaign = await usecases.startLtiCampaign({
      campaignId,
      lineItemsUrl,
      resourceLinkId,
      registration,
      platformUserSub,
    });

    // then
    expect(campaign).to.be.an.instanceOf(LtiCampaign);
    expect(campaign.id).to.equal(campaignId);
    expect(competenceLineItemCreation.isDone()).to.be.true;
    expect(masteryRateLineItemCreation.isDone()).to.be.true;
    expect(await findLtiCampaignParticipations()).to.deep.equal([
      { clientId, platformUserSub, lineItemContainerUrl: lineItemsUrl, campaignId },
    ]);
  });

  context('when the participation has already been saved', function () {
    it('does not save it twice', async function () {
      // given
      databaseBuilder.factory.buildLtiCampaignParticipation({
        clientId,
        platformUserSub,
        lineItemContainerUrl: lineItemsUrl,
        campaignId,
      });
      await databaseBuilder.commit();
      mockAccessTokenRequest();
      mockLineItemsListing({
        existingLineItems: [
          { resourceId: `pix:campaign:${campaignId}:competence:recCompetence1` },
          { resourceId: `pix:campaign:${campaignId}:mastery-rate` },
        ],
      });

      // when
      await usecases.startLtiCampaign({ campaignId, lineItemsUrl, resourceLinkId, registration, platformUserSub });

      // then
      expect(await findLtiCampaignParticipations()).to.have.lengthOf(1);
    });
  });

  context('when the campaign does not exist', function () {
    it('throws a LtiCampaignNotFoundError without requesting the platform', async function () {
      // given
      const accessTokenRequest = mockAccessTokenRequest();
      const listing = mockLineItemsListing();

      // when
      const error = await catchErr(usecases.startLtiCampaign)({
        campaignId: campaignId + 1,
        lineItemsUrl,
        resourceLinkId,
        registration,
        platformUserSub,
      });

      // then
      expect(error).to.be.instanceOf(LtiCampaignNotFoundError);
      expect(accessTokenRequest.isDone()).to.be.false;
      expect(listing.isDone()).to.be.false;
      expect(await findLtiCampaignParticipations()).to.be.empty;
    });
  });

  context('when the campaign id is not an integer', function () {
    it('throws a LtiCampaignNotFoundError', async function () {
      // when
      const error = await catchErr(usecases.startLtiCampaign)({
        campaignId: NaN,
        lineItemsUrl,
        resourceLinkId,
        registration,
        platformUserSub,
      });

      // then
      expect(error).to.be.instanceOf(LtiCampaignNotFoundError);
    });
  });

  context('when the platform does not deliver an access token', function () {
    it('throws a LtiLineItemsInitializationError without initializing the line items nor saving the participation', async function () {
      // given
      mockAccessTokenRequest({ status: 401, body: 'invalid client' });
      const listing = mockLineItemsListing();

      // when
      const error = await catchErr(usecases.startLtiCampaign)({
        campaignId,
        lineItemsUrl,
        resourceLinkId,
        registration,
        platformUserSub,
      });

      // then
      expect(error).to.be.instanceOf(LtiLineItemsInitializationError);
      expect(listing.isDone()).to.be.false;
      expect(await findLtiCampaignParticipations()).to.be.empty;
    });
  });

  context('when line items cannot be initialized', function () {
    it('throws a LtiLineItemsInitializationError without saving the participation', async function () {
      // given
      mockAccessTokenRequest();
      mockLineItemsListing({ status: 500 });

      // when
      const error = await catchErr(usecases.startLtiCampaign)({
        campaignId,
        lineItemsUrl,
        resourceLinkId,
        registration,
        platformUserSub,
      });

      // then
      expect(error).to.be.instanceOf(LtiLineItemsInitializationError);
      expect(await findLtiCampaignParticipations()).to.be.empty;
    });
  });
});
