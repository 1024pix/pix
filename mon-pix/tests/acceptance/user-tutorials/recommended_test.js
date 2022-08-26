import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { findAll, find, click } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { authenticateByEmail } from '../../helpers/authentication';

describe('Acceptance | User-tutorials-v2 | Recommended', function () {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(async function () {
    user = server.create('user', 'withEmail');
    await authenticateByEmail(user);
    await server.db.tutorials.remove();
  });

  describe('When there are recommended tutorials', () => {
    it('should display paginated tutorial cards', async function () {
      // given
      server.createList('tutorial', 100);

      // when
      await visit('/mes-tutos/recommandes');

      //then
      expect(findAll('.tutorial-card-v2')).to.exist;
      expect(findAll('.tutorial-card-v2')).to.be.lengthOf(10);
      expect(find('.pix-pagination__navigation').textContent).to.contain('Page 1 / 10');
    });

    describe('when a tutorial is not already saved', function () {
      it('should saved it when user click on save button', async function () {
        // given
        server.createList('tutorial', 1);
        const screen = await visit('/mes-tutos/recommandes');

        // when
        await click(screen.getByLabelText('Enregistrer dans ma liste de tutos'));

        // then
        expect(findAll('.tutorial-card-v2')).to.be.lengthOf(1);
        expect(screen.getByLabelText('Retirer de ma liste de tutos')).to.exist;
      });
    });

    describe('when a tutorial is saved', function () {
      it('should not remove it from the list when clicking on the remove button', async function () {
        // given
        server.createList('tutorial', 1, 'withUserTutorial');
        const screen = await visit('/mes-tutos/recommandes');

        // when
        await click(screen.getByLabelText('Retirer de ma liste de tutos'));

        // then
        expect(findAll('.tutorial-card-v2')).to.be.lengthOf(1);
      });
    });

    describe('when a tutorial is liked', function () {
      it('should retrieve the appropriate status when changing page', async function () {
        // given
        server.createList('tutorial', 1, 'withUserTutorial', 'withTutorialEvaluation');
        const screen = await visit('/mes-tutos/recommandes');

        // when
        await click(screen.getByLabelText('Ne plus considérer ce tuto comme utile'));
        await visit('/mes-tutos/enregistres');

        // then
        expect(screen.getByLabelText('Marquer ce tuto comme utile')).to.exist;
      });
    });
  });
});
