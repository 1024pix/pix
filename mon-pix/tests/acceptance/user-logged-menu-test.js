import { click, currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { authenticateByEmail } from '../helpers/authentication';
import { contains } from '../helpers/contains';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import ENV from 'mon-pix/config/environment';

describe('Acceptance | User account', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(async function() {
    //given
    ENV.APP.FT_DASHBOARD = true;
    server.create('campaign-participation-overview', { assessmentState: 'completed' });
    user = server.create('user', 'withEmail', 'campaignParticipations');
    await authenticateByEmail(user);
  });

  afterEach(function() {
    ENV.APP.FT_DASHBOARD = false;
  });

  describe('When in profile', function() {
    it('should open tests page when click on menu', async function() {
      // when
      await click('.logged-user-name');
      await click(contains('Mes parcours'));

      // then
      expect(currentURL()).to.equal('/mes-parcours');
    });

    it('should open certifications page when click on menu', async function() {
      // when
      await click('.logged-user-name');
      await click(contains('Mes certifications'));

      // then
      expect(currentURL()).to.equal('/mes-certifications');
    });

    it('should contain link to pix.fr/aide', async function() {
      // when
      await click('.logged-user-name');
      const helplink = contains('Aide').getAttribute('href');

      // then
      expect(helplink).to.equal('https://pix.fr/aide');
    });

  });
});
