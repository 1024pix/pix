import { click, currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { authenticateByEmail } from '../helpers/authentication';
import { clickByLabel } from '../helpers/click-by-label';
import findByLabel from '../helpers/find-by-label';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | User account', function() {

  setupApplicationTest();
  setupMirage();

  let user;

  beforeEach(async function() {
    //given
    server.create('campaign-participation-overview', { assessmentState: 'completed' });
    user = server.create('user', 'withEmail', 'campaignParticipations');
    await authenticateByEmail(user);
  });

  describe('When in profile', function() {

    it('should open tests page when click on menu', async function() {
      // when
      await click('.logged-user-name');
      await clickByLabel('Mes parcours');

      // then
      expect(currentURL()).to.equal('/mes-parcours');
    });

    it('should open certifications page when click on menu', async function() {
      // when
      await click('.logged-user-name');
      await clickByLabel('Mes certifications');

      // then
      expect(currentURL()).to.equal('/mes-certifications');
    });

    it('should contain link to pix.fr/aide', async function() {
      // when
      await click('.logged-user-name');
      const helplink = findByLabel('Aide').getAttribute('href');

      // then
      expect(helplink).to.equal('https://pix.fr/aide');
    });

    it('should open My account page when click on menu', async function() {
      // given
      await click('.logged-user-name');

      // when
      await clickByLabel('Mon compte');

      // then
      expect(currentURL()).to.equal('/mon-compte/informations-personnelles');
    });
  });
});
