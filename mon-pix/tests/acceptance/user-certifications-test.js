import { currentURL, find, findAll } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { authenticateByEmail } from '../helpers/authentification';
import { expect } from 'chai';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | User certifications page', function() {
  setupApplicationTest();
  setupMirage();
  let userWithNoCertificates;

  beforeEach(function() {
    userWithNoCertificates = server.create('user', 'withEmail');
  });

  describe('Access to the user certifications page', function() {

    it('should not be accessible when user is not connected', async function() {
      // when
      await visit('/mes-certifications');

      // then
      expect(currentURL()).to.equal('/connexion');
    });

    it('should be accessible when user is connected', async function() {
      // given
      await authenticateByEmail(userWithNoCertificates);

      // when
      await visit('/mes-certifications');

      // then
      expect(currentURL()).to.equal('/mes-certifications');
    });
  });

  describe('Display', function() {

    it('should render the banner', async function() {
      // when
      await authenticateByEmail(userWithNoCertificates);
      await visit('/mes-certifications');

      // then
      expect(find('.navbar-desktop-header__container')).to.exist;
    });

    it('should render a title for the page', async function() {
      // when
      await authenticateByEmail(userWithNoCertificates);
      await visit('/mes-certifications');

      // then
      expect(find('.user-certifications-page__title')).to.exist;
    });

    it('should render the panel which contains informations about certifications of the connected user', async function() {
      // when
      await authenticateByEmail(userWithNoCertificates);
      await visit('/mes-certifications');

      // then
      expect(find('.user-certifications-panel')).to.exist;
    });

    context('when user has no certificates', function() {

      it('should dislpay the no certificates panel', async function() {
        // when
        await authenticateByEmail(userWithNoCertificates);
        await visit('/mes-certifications');

        // then
        expect(find('.no-certification-panel')).to.exist;
      });
    });

    context('when user has some certificates', function() {

      it('should display the user certificates', async function() {
        // given
        const userWithSomeCertificates = server.create('user', 'withEmail', 'withSomeCertificates');

        // when
        await authenticateByEmail(userWithSomeCertificates);
        await visit('/mes-certifications');

        // then
        expect(findAll('.certifications-list__table-body .certifications-list-item').length)
          .to.equal(userWithSomeCertificates.certifications.length);
      });
    });

  });

});
