import { clickByName, visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click } from '@ember/test-helpers';

module('Acceptance | Challenge workflow', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('when user click on skip button', function () {
    test('redirects to next challenge', async function (assert) {
      const assessment = this.server.create('assessment');
      this.server.create('challenge', { id: 1 });
      this.server.create('challenge', { id: 2, instruction: 'challenge alternatif' });
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      await click(screen.getByRole('button', { name: 'Je passe' }));

      // then
      assert.dom(screen.getByText('challenge alternatif')).exists();
    });
  });

  module('when user click on continue button without answer', function () {
    test('displays warning modal', async function (assert) {
      const assessment = this.server.create('assessment');
      this.server.create('challenge');
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      await click(screen.getByRole('button', { name: 'Je continue' }));

      // then
      const modalText = screen.getByText("Pour valider la mission, tu dois terminer l'activité.");
      assert.false(modalText.closest('.pix-modal__overlay').classList.contains('pix-modal__overlay--hidden'));
    });
  });

  module('when user click on continue button with correct answer', function () {
    test('displays answer modal with correct answer text', async function (assert) {
      const assessment = this.server.create('assessment');
      this.server.create('challenge', 'QCU');
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      await click(screen.getByRole('radio', { name: 'Profil 1' }));
      await click(screen.getByRole('button', { name: 'Je continue' }));

      // then
      const modalText = screen.getByText("Bravo ! C'est la bonne réponse.");
      assert.false(modalText.closest('.pix-modal__overlay').classList.contains('pix-modal__overlay--hidden'));
    });
  });

  module('when user click on continue button with bad answer', function () {
    test('displays answer modal with bad response text', async function (assert) {
      const assessment = this.server.create('assessment');
      this.server.create('challenge', 'QROCWithSelect');
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      await clickByName('saladAriaLabel');
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'bad-answer' }));

      await click(screen.getByRole('button', { name: 'Je continue' }));

      // then
      const modalText = screen.getByText('Mauvaise réponse. Tu peux passer à la suite.');
      assert.false(modalText.closest('.pix-modal__overlay').classList.contains('pix-modal__overlay--hidden'));
    });
  });

  module("when user doesn't click yet", function () {
    test('do not displays any modals', async function (assert) {
      const assessment = this.server.create('assessment');
      this.server.create('challenge');
      // when
      await visit(`/assessments/${assessment.id}/challenges`);

      // then
      document.querySelectorAll('.pix-modal__overlay').forEach((modalElement) => {
        assert.true(modalElement.classList.contains('pix-modal__overlay--hidden'));
      });
    });
  });
});
