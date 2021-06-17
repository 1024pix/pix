import { describe } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import visit from '../helpers/visit';
import { currentURL } from '@ember/test-helpers';

describe('Acceptance | RecoverAccountAfterLeavingScoRoute', function() {
  setupApplicationTest();
  setupMirage();

  context('when account recovery is disabled by default', () => {

    it('should redirect to login page', async () => {
      // given / when
      await visit('/sos');

      // then
      expect(currentURL()).to.equal('/connexion');
    });
  });

  context('when account recovery is enabled', () => {

    it('should access to account recovery page', async () => {
      // given
      server.create('feature-toggle', { id: 0, isScoAccountRecoveryEnabled: true });

      //when
      await visit('/sos');

      // then
      expect(currentURL()).to.equal('/sos');
    });
  });

});
