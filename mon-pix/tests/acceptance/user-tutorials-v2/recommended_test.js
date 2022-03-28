import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit, findAll, find } from '@ember/test-helpers';
import { authenticateByEmail } from '../../helpers/authentication';

describe('Acceptance | User-tutorials-v2 | Recommended', function () {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(async function () {
    const numberOfTutorials = 100;
    user = server.create('user', 'withEmail');
    server.create('feature-toggle', { id: 0, isNewTutorialsPageEnabled: true });
    await authenticateByEmail(user);
    await server.db.tutorials.remove();
    server.createList('tutorial', numberOfTutorials);
  });

  describe('When there are recommended tutorials', () => {
    it('should display paginated tutorial cards', async function () {
      await visit('/mes-tutos-v2/recommandes');
      expect(findAll('.tutorial-card-v2')).to.exist;
      expect(findAll('.tutorial-card-v2')).to.be.lengthOf(10);
      expect(find('.pix-pagination__navigation').textContent).to.contain('Page 1 / 10');
    });
  });
});
