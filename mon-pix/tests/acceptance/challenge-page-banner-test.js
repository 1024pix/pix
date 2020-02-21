import { click, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { authenticateByEmail } from '../helpers/authentification';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Challenge page banner', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(function() {
    defaultScenario(this.server);
    user = server.create('user', 'withEmail');
  });

  async function startCampaign() {
    await authenticateByEmail(user);
    await visitWithAbortedTransition('campagnes/CAMPAIGN_CODE');

    await click('.campaign-landing-page__start-button');
    await click('.campaign-tutorial__ignore-button');
  }

  context('When user is starting a campaign assessment', function() {

    it('should display a campaign banner', async function() {
      // given
      const campaignTitle = 'Ma Campagne';
      this.server.create('campaign', { title: campaignTitle, code: 'CAMPAIGN_CODE' });

      // when
      await startCampaign();

      // then
      find('.assessment-banner');
    });

    it('should display the campaign name in the banner', async function() {
      // given
      const campaignTitle = 'Ma Campagne';

      this.server.post('/campaign-participations', function(schema) {
        const newAssessment = {
          'id': 'ref_assessment_campaign_id',
          'user-id': 'user_id',
          'user-name': `${user.firstName} ${user.lastName}`,
          'user-email': user.email,
        };
        newAssessment.type = 'SMART_PLACEMENT';
        newAssessment.codeCampaign = 'CAMPAIGN_CODE';
        newAssessment.title = campaignTitle;

        const assessment = schema.assessments.create(newAssessment);
        return schema.campaignParticipations.create({ assessment });
      });
      this.server.get('assessments/:id', function(schema, request) {
        const id = request.params.id;
        return schema.assessments.find(id);
      });

      this.server.create('campaign', { title: campaignTitle, code: 'CAMPAIGN_CODE' });

      // when
      await startCampaign();

      // then
      expect(find('.assessment-banner__title').textContent).to.equal(campaignTitle);
    });
  });
});
