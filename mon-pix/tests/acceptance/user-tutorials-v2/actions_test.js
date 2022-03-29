import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, find, visit } from '@ember/test-helpers';
import { authenticateByEmail } from '../../helpers/authentication';

describe('Acceptance | User-tutorials-v2 | Actions', function () {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(async function () {
    user = server.create('user', 'withEmail');
    server.create('feature-toggle', { id: 0, isNewTutorialsPageEnabled: true });
    await authenticateByEmail(user);
  });

  describe('Evaluate tutorial', () => {
    it('should disable evaluate action on click', async function () {
      await visit('/mes-tutos-v2/recommandes');

      await click('.tutorial-card-v2-content-actions__evaluate');

      expect(find('.tutorial-card-v2-content-actions__evaluate').disabled).to.be.true;
    });
  });
});
