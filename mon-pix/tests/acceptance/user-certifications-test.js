import { currentURL, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { authenticateAsSimpleUser } from '../helpers/testing';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | User certifications page', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(function() {
    defaultScenario(this.server);
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
      await authenticateAsSimpleUser();

      // when
      await visitWithAbortedTransition('/mes-certifications');

      // then
      expect(currentURL()).to.equal('/mes-certifications');
    });
  });

  describe('Display', function() {

    it('should render the banner', async function() {
      // when
      await authenticateAsSimpleUser();
      await visitWithAbortedTransition('/mes-certifications');

      // then
      expect(find('.navbar-header__container')).to.exist;
    });

    it('should render a title for the page', async function() {
      // when
      await authenticateAsSimpleUser();
      await visitWithAbortedTransition('/mes-certifications');

      // then
      expect(find('.user-certifications-page__title')).to.exist;
    });

    it('should render the panel which contains informations about certifications of the connected user', async function() {
      // when
      await authenticateAsSimpleUser();
      await visitWithAbortedTransition('/mes-certifications');

      // then
      expect(find('.user-certifications-panel')).to.exist;
    });

  });

});
