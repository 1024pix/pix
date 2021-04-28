import { find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-mocha';
import { authenticateByEmail } from '../helpers/authentication';
import { resumeCampaignOfTypeAssessmentByCode } from '../helpers/campaign';
import visit from '../helpers/visit';

describe('Acceptance | Footer', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(function() {
    user = server.create('user', 'withEmail');
  });

  describe('Authenticated cases as simple user', function() {
    beforeEach(async function() {
      await authenticateByEmail(user);
    });

    it('should not be displayed while in campaign', async function() {
      // given
      const campaign = server.create('campaign', 'withOneChallenge');

      // when
      await resumeCampaignOfTypeAssessmentByCode(campaign.code, false);

      // then
      expect(find('.footer')).to.not.exist;
    });

    it('should contain link to pix.fr/aide', async function() {
      // when
      await visit('/');

      // then
      expect(find('.footer-container-content__navigation ul li:nth-child(1) a').getAttribute('href')).to.contains('/aide');
    });

    it('should contain link to pix.fr/accessibilite', async function() {
      // when
      await visit('/');

      // then
      expect(find('.footer-container-content__navigation ul li:nth-child(2) a').getAttribute('href')).to.contains('/accessibilite');
    });
  });
});
