import { click, currentURL, fillIn } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { authenticateByEmail } from '../helpers/authentication';
import { expect } from 'chai';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { contains } from '../helpers/contains';
import { clickByLabel } from '../helpers/click-by-label';

describe('Acceptance | User account page', function() {
  setupApplicationTest();
  setupMirage();

  context('When user is not connected', function() {

    it('should be redirected to connection page', async function() {
      // when
      await visit('/mon-compte');

      // then
      expect(currentURL()).to.equal('/connexion');
    });
  });

  context('When user is connected', function() {

    let user;

    beforeEach(async function() {
      user = server.create('user', 'withEmail');
      await authenticateByEmail(user);
    });

    it('should display my account page', async function() {
      // when
      await visit('/mon-compte');

      // then
      expect(currentURL()).to.equal('/mon-compte/informations-personnelles');
    });

    it('should be able to edit the email', async function() {
      // given
      const newEmail = 'new-email@example.net';
      await visit('/mon-compte');

      // when
      await click('button[data-test-edit-email]');
      await fillIn('#newEmail', newEmail);
      await fillIn('#newEmailConfirmation', newEmail);
      await fillIn('#password', user.password);
      await click('button[data-test-submit-email]');

      // then
      expect(user.email).to.equal(newEmail);
    });

    describe('My account menu', function() {

      it('should display my account menu', async function() {
        // when
        await visit('/mon-compte');

        // then
        expect(contains('Informations personnelles')).to.exist;
        expect(contains('Méthodes de connexion')).to.exist;
      });

      it('should display personal information on click on "Informations personnelles"', async function() {
        // given
        await visit('/mon-compte');

        // when
        await clickByLabel('Informations personnelles');

        // then
        expect(currentURL()).to.equal('/mon-compte/informations-personnelles');
      });

      it('should display connection methods on click on "Méthodes de connexion"', async function() {
        // given
        await visit('/mon-compte');

        // when
        await clickByLabel('Méthodes de connexion');

        // then
        expect(currentURL()).to.equal('/mon-compte/methodes-de-connexion');
      });
    });
  });
});
