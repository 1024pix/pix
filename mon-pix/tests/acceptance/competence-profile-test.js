import { click, currentURL, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateViaEmail } from '../helpers/authentification';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setBreakpoint } from 'ember-responsive/test-support';

describe('Acceptance | Profile | Start competence', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(function() {
    defaultScenario(this.server);
    user = server.create('user', 'withEmail');
  });

  describe('Authenticated cases as simple user', function() {
    beforeEach(async function() {
      await authenticateViaEmail(user);
    });

    it('can start a competence', async function() {
      // when
      await visitWithAbortedTransition('/profil');
      await setBreakpoint('tablet');
      await click('.rounded-panel-body__areas:first-child .rounded-panel-body__competence-card:first-child .competence-card__button');

      // then
      expect(currentURL()).to.contains('/assessments/');
      expect(find('.assessment-challenge__content')).to.exist;
    });
  });
});
