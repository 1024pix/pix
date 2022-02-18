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

  describe('When the the new tutorials page is enabled', function () {
    beforeEach(async function () {
      user = server.create('user', 'withEmail');
      server.create('feature-toggle', { id: 0, isNewTutorialsPageEnabled: true });
      await authenticateByEmail(user);
    });

    it('user is redirected to /mes-tutos-v2/recommandes when visiting /mes-tutos', async function () {
      await visit('/mes-tutos');
      expect(currentURL()).to.equal('/mes-tutos-v2/recommandes');
    });

    it('user is redirected to /mes-tutos-v2/recommandes when visiting /mes-tutos-v2', async function () {
      await visit('/mes-tutos-v2');
      expect(currentURL()).to.equal('/mes-tutos-v2/recommandes');
    });
  });

  describe('When the the new tutorials page is disabled', function () {
    beforeEach(async function () {
      user = server.create('user', 'withEmail');
      server.create('feature-toggle', { id: 0, isNewTutorialsPageEnabled: false });
      await authenticateByEmail(user);
    });

    it('user is redirected to /mes-tutos when visiting /mes-tutos-v2', async function () {
      await visit('/mes-tutos-v2');
      expect(currentURL()).to.equal('/mes-tutos');
    });

    it('user is redirected to /mes-tutos when visiting /mes-tutos-v2/recommandes', async function () {
      await visit('/mes-tutos-v2/recommandes');
      expect(currentURL()).to.equal('/mes-tutos');
    });

    it('user is redirected to /mes-tutos when visiting /mes-tutos-v2/enregistres', async function () {
      await visit('/mes-tutos-v2/enregistres');
      expect(currentURL()).to.equal('/mes-tutos');
    });
  });
});
