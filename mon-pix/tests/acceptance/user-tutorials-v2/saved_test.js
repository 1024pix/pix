import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit, find } from '@ember/test-helpers';
import { authenticateByEmail } from '../../helpers/authentication';

describe('Acceptance | User-tutorials-v2 | Saved', function () {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(async function () {
    user = server.create('user', 'withEmail');
    server.create('feature-toggle', { id: 0, isNewTutorialsPageEnabled: true });
    await authenticateByEmail(user);
  });

  describe('When there are tutorials saved', () => {
    it('should display tutorial cards', async function () {
      await visit('/mes-tutos-v2/enregistres');
      expect(find('.tutorial-card-v2')).to.exist;
    });
  });
});
