import { currentURL, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { authenticateViaEmail } from '../helpers/testing';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | User certifications page', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(function() {
    defaultScenario(this.server);
    user = server.create('user', 'withEmail');
  });

  describe('Access to the user certifications page', function() {

    it('should not be accessible when user is not connected', async function() {
      // when
      await visitWithAbortedTransition('/mes-certifications');

      // then
      expect(currentURL()).to.equal('/connexion');
    });

    it('should be accessible when user is connected', async function() {
      // given
      await authenticateViaEmail(user);

      // when
      await visitWithAbortedTransition('/mes-certifications');

      // then
      expect(currentURL()).to.equal('/mes-certifications');
    });
  });

  describe('Display', function() {

    it('should render the banner', async function() {
      // when
      await authenticateViaEmail(user);
      await visitWithAbortedTransition('/mes-certifications');

      // then
      expect(find('.navbar-desktop-header__container')).to.exist;
    });

    it('should render a title for the page', async function() {
      // when
      await authenticateViaEmail(user);
      await visitWithAbortedTransition('/mes-certifications');

      // then
      expect(find('.user-certifications-page__title')).to.exist;
    });

    it('should render the panel which contains informations about certifications of the connected user', async function() {
      // when
      await authenticateViaEmail(user);
      await visitWithAbortedTransition('/mes-certifications');

      // then
      expect(find('.user-certifications-panel')).to.exist;
    });

  });

});
