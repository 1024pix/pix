import { click, currentURL } from '@ember/test-helpers';
import { describe, it } from 'mocha';
import { authenticateByEmail } from '../helpers/authentication';
import { clickByLabel } from '../helpers/click-by-label';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit } from '@1024pix/ember-testing-library';
import { fillIn } from '@ember/test-helpers';

describe('Acceptance | User account', function () {
  setupApplicationTest();
  setupMirage();

  describe('When in profile', function () {
    it('should open tests page when click on menu', async function () {
      //given
      server.create('campaign-participation-overview', { assessmentState: 'completed' });
      const user = server.create('user', 'withEmail', 'withAssessmentParticipations');
      await authenticateByEmail(user);

      // when
      await click('.logged-user-name');
      await clickByLabel('Mes parcours');

      // then
      expect(currentURL()).to.equal('/mes-parcours');
    });

    it('should open certifications page when click on menu', async function () {
      //given
      server.create('campaign-participation-overview', { assessmentState: 'completed' });
      const user = server.create('user', 'withEmail', 'withAssessmentParticipations');
      await authenticateByEmail(user);

      // when
      await click('.logged-user-name');
      await clickByLabel('Mes certifications');

      // then
      expect(currentURL()).to.equal('/mes-certifications');
    });

    it('should contain link to support.pix.org/fr/support/home', async function () {
      // given
      server.create('campaign-participation-overview', { assessmentState: 'completed' });
      const user = server.create('user', 'withEmail', 'withAssessmentParticipations');
      const screen = await visit('/connexion');
      await fillIn('#login', user.email);
      await fillIn('#password', user.password);
      await clickByLabel('Je me connecte');

      // when
      await click('.logged-user-name');
      const helplink = screen.getByRole('link', { name: 'Aide' }).getAttribute('href');

      // then
      expect(helplink).to.equal('https://support.pix.org/fr/support/home');
    });

    it('should open My account page when click on menu', async function () {
      //given
      server.create('campaign-participation-overview', { assessmentState: 'completed' });
      const user = server.create('user', 'withEmail', 'withAssessmentParticipations');
      await authenticateByEmail(user);

      // given
      await click('.logged-user-name');

      // when
      await clickByLabel('Mon compte');

      // then
      expect(currentURL()).to.equal('/mon-compte/informations-personnelles');
    });
  });
});
