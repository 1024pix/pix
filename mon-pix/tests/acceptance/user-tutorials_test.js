import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit, currentURL } from '@ember/test-helpers';
import { authenticateByEmail } from '../helpers/authentication';

describe('Acceptance | mes-tutos', function () {
  setupApplicationTest();
  setupMirage();
  let user;

  describe('When the the new tutorials page is disabled', function () {
    beforeEach(async function () {
      user = server.create('user', 'withEmail');
      await authenticateByEmail(user);
    });

    it('user is redirected to /mes-tutos/recommandes when visiting /mes-tutos', async function () {
      await visit('/mes-tutos');
      expect(currentURL()).to.equal('/mes-tutos/recommandes');
    });

    it('user is redirected to /mes-tutos/enregistres when visiting /mes-tutos/enregistres', async function () {
      await visit('/mes-tutos/enregistres');
      expect(currentURL()).to.equal('/mes-tutos/enregistres');
    });
  });
});
