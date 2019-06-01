import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import defaultScenario from '../../mirage/scenarios/default';
import { authenticateAsSimpleUser } from '../helpers/testing';

describe('Acceptance | Challenge page banner', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  async function startCampaign() {
    await authenticateAsSimpleUser();
    await visit('campagnes/CAMPAIGN_CODE');

    await click('.campaign-landing-page__start-button');
    await click('.campaign-tutorial__ignore-button');

  }

  context('When user is starting a campaign assessment', function() {

    it('should display a campaign banner', async function() {
      // given
      const campaignTitle = 'Ma Campagne';
      server.create('campaign', { title: campaignTitle, code: 'CAMPAIGN_CODE' });

      // when
      await startCampaign();

      // then
      findWithAssert('.campaign-banner');
    });

    it('should display the campaign name in the banner', async function() {
      // given
      const campaignTitle = 'Ma Campagne';

      server.post('/campaign-participations', function(schema) {
        const newAssessment = {
          'id': 'ref_assessment_campaign_id',
          'user-id': 'user_id',
          'user-name': 'Jane Doe',
          'user-email': 'jane@acme.com',
        };
        newAssessment.type = 'SMART_PLACEMENT';
        newAssessment.codeCampaign = 'CAMPAIGN_CODE';
        newAssessment.title = campaignTitle;

        const assessment = schema.assessments.create(newAssessment);
        return schema.campaignParticipations.create({ assessment });
      });
      server.get('assessments/:id', function(schema, request) {
        const id = request.params.id;
        return schema.assessments.find(id);
      });

      server.create('campaign', { title: campaignTitle, code: 'CAMPAIGN_CODE' });

      // when
      await startCampaign();

      // then
      expect(find('.campaign-banner__title h1').text()).to.equal(campaignTitle);
    });
  });
});
