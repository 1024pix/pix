import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit, findAll } from '@ember/test-helpers';
import { authenticateByEmail } from '../../helpers/authentication';

describe('Acceptance | User-tutorials-v2 | Recommended', function () {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(async function () {
    user = server.create('user', 'withEmail');
    server.create('feature-toggle', { id: 0, isNewTutorialsPageEnabled: true });
    await authenticateByEmail(user);
    await server.db.tutorials.remove();
    server.create('tutorial');
    server.create('tutorial');
  });

  describe('When there are recommended tutorials', () => {
    it('should display tutorial cards', async function () {
      await visit('/mes-tutos-v2/recommandes');
      expect(findAll('.tutorial-card-v2')).to.exist;
      expect(findAll('.tutorial-card-v2')).to.be.lengthOf(2);
    });
  });
});
