import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit, click, find, findAll } from '@ember/test-helpers';
import { authenticateByEmail } from '../../helpers/authentication';

describe('Acceptance | User-tutorials-v2 | Saved', function () {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(async function () {
    const numberOfTutorials = 100;
    user = server.create('user', 'withEmail');
    server.create('feature-toggle', { id: 0, isNewTutorialsPageEnabled: true });
    await authenticateByEmail(user);
    await server.db.tutorials.remove();
    server.createList('tutorial', numberOfTutorials, 'withUserTutorial');
  });

  describe('When there are tutorials saved', function () {
    it('should display paginated tutorial cards', async function () {
      await visit('/mes-tutos-v2/enregistres');
      expect(findAll('.tutorial-card-v2')).to.exist;
      expect(findAll('.tutorial-card-v2')).to.be.lengthOf(10);
      expect(find('.pix-pagination__navigation').textContent).to.contain('Page 1 / 10');
    });

    describe('when user clicking save again', function () {
      it('should remove tutorial ', async function () {
        // given
        const numberOfTutorials = 10;
        await server.db.tutorials.remove();
        server.createList('tutorial', numberOfTutorials, 'withUserTutorial');
        await visit('/mes-tutos-v2/enregistres');

        // when
        await click('.tutorial-card-v2-content-actions__save');

        // then
        expect(findAll('.tutorial-card-v2')).to.be.lengthOf(9);
      });
    });
  });
});
