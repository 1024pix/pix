import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { find, findAll, click } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { authenticateByEmail } from '../../helpers/authentication';

describe('Acceptance | User-tutorials-v2 | Saved', function () {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(async function () {
    server.create('feature-toggle', { id: 0, isPixAppTutoFiltersEnabled: true });
    const numberOfTutorials = 100;
    user = server.create('user', 'withEmail');
    await authenticateByEmail(user);
    await server.db.tutorials.remove();
    server.createList('tutorial', numberOfTutorials, 'withUserSavedTutorial');
  });

  describe('When there are tutorials saved', function () {
    it('should display paginated tutorial cards', async function () {
      await visit('/mes-tutos/enregistres');
      expect(findAll('.tutorial-card-v2')).to.exist;
      expect(findAll('.tutorial-card-v2')).to.be.lengthOf(10);
      expect(find('.pix-pagination__navigation').textContent).to.contain('Page 1 / 10');
    });

    describe('when user clicking save again', function () {
      it('should remove tutorial ', async function () {
        // given
        const numberOfTutorials = 10;
        await server.db.tutorials.remove();
        await server.db.userSavedTutorials.remove();
        server.createList('tutorial', numberOfTutorials, 'withUserSavedTutorial');
        await visit('/mes-tutos/enregistres');

        // when
        await click('[aria-label="Retirer de ma liste de tutos"]');

        // then
        expect(findAll('.tutorial-card-v2')).to.be.lengthOf(9);
      });
    });
  });
});
