import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { find, findAll, click, currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { authenticateByEmail } from '../../helpers/authentication';
import { waitForDialog } from '../../helpers/wait-for';

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
    server.createList('tutorial', numberOfTutorials, 'withUserTutorial');
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
        await server.db.userTutorials.remove();
        server.createList('tutorial', numberOfTutorials, 'withUserTutorial');
        await visit('/mes-tutos/enregistres');

        // when
        await click('[aria-label="Retirer de ma liste de tutos"]');

        // then
        expect(findAll('.tutorial-card-v2')).to.be.lengthOf(9);
      });
    });

    describe('when user is filtering by competences', function () {
      it('should filter tutorial by competence and close sidebar', async function () {
        // given
        await server.db.tutorials.remove();
        await server.db.userTutorials.remove();

        server.create('area', 'withCompetences');
        server.createList('tutorial', 10, 'withUserTutorial');
        const screen = await visit('/mes-tutos/enregistres');
        expect(findAll('.tutorial-card-v2')).to.be.lengthOf(10);

        await click(screen.getByRole('button', { name: 'Filtrer' }));
        await waitForDialog();
        await click(screen.getByRole('button', { name: 'Mon super domaine' }));
        await click(screen.getByRole('checkbox', { name: 'Ma superbe compétence' }));

        // when
        await click(screen.getByRole('button', { name: 'Voir les résultats' }));

        // then
        expect(currentURL()).to.equal('/mes-tutos/enregistres?competences=1&pageNumber=1');
        expect(findAll('.tutorial-card-v2')).to.be.lengthOf(1);
        expect(find('.pix-sidebar--hidden')).to.exist;
      });

      describe('when user access again to tutorials saved page', function () {
        it('should reset competences filters', async function () {
          // given
          const screen = await visit('/mes-tutos/enregistres?competences=1&pageNumber=1');

          // when
          await click(screen.getByRole('link', { name: 'Recommandés' }));
          await click(screen.getByRole('link', { name: 'Enregistrés' }));

          // then
          expect(currentURL()).to.equal('/mes-tutos/enregistres');
        });
      });
    });
  });
});
