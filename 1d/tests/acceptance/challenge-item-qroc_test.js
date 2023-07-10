import { click, fillIn, findAll } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { clickByName, visit, within } from '@1024pix/ember-testing-library';

module('Acceptance | Displaying a QROC challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let assessment;

  //TODO Ajouter test d'affichage image/embed
  module('with input format', function (hooks) {
    hooks.beforeEach(async function () {
      assessment = this.server.create('assessment');
      this.server.create('challenge');
    });

    test('should render challenge information and question', async function (assert) {
      // when
      await visit(`/assessments/${assessment.id}/challenges`);
      // then
      assert.dom('.challenge-response__proposal').exists({ count: 2 });
      assert.ok(findAll('.qroc_input-label')[0].innerHTML.includes('Rue de : '));
    });

    test.skip('should display the warning dialog if user validates without writing an answer in input', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      assert.dom(screen.getByText("Pour valider la mission, tu dois terminer l'activité.")).doesNotExist();
      await click(within(document.querySelector('.challenge-actions')).getByRole('button', { name: 'Je continue' }));

      // then
      assert.dom(screen.getByText("Pour valider la mission, tu dois terminer l'activité.")).exists();
    });

    test('should display answer feedback dialog if user validates after writing the right answer in input', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      await fillIn('input[data-uid="qroc-proposal-uid"]', 'good-answer');
      await click(within(document.querySelector('.challenge-actions')).getByRole('button', { name: 'Je continue' }));

      // then
      assert.dom(screen.getByText("Bravo ! C'est la bonne réponse.")).exists();
    });
  });

  module('with text-area format', function (hooks) {
    hooks.beforeEach(async function () {
      assessment = this.server.create('assessment');
      this.server.create('challenge', 'withTextArea');
    });

    test('should render challenge information and question', async function (assert) {
      // when
      await visit(`/assessments/${assessment.id}/challenges`);
      // then
      assert.dom('.challenge-response__proposal').exists({ count: 1 });
      assert.ok(findAll('.qroc_input-label')[0].innerHTML.includes('Rue de : '));
    });

    test.skip('should display the warning dialog if user validates without writing an answer in input', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      assert.dom(screen.getByText("Pour valider la mission, tu dois terminer l'activité.")).doesNotExist();
      await click(within(document.querySelector('.challenge-actions')).getByRole('button', { name: 'Je continue' }));

      // then
      assert.dom(screen.getByText("Pour valider la mission, tu dois terminer l'activité.")).exists();
    });

    test('should display answer feedback dialog if user validates after writing the right answer in text area', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      await fillIn('textarea[data-uid="qroc-proposal-uid"]', 'good-answer');
      await click(within(document.querySelector('.challenge-actions')).getByRole('button', { name: 'Je continue' }));

      // then
      assert.dom(screen.getByText("Bravo ! C'est la bonne réponse.")).exists();
    });
  });

  module('with select format', function (hooks) {
    hooks.beforeEach(async function () {
      assessment = this.server.create('assessment');
      this.server.create('challenge', 'QROCWithSelect');
    });

    test('should render challenge information and question', async function (assert) {
      // given
      await visit(`/assessments/${assessment.id}/challenges`);

      // then
      assert.dom('.challenge-response__proposal').exists({ count: 1 });
      assert.ok(findAll('.qroc_input-label')[0].innerHTML.includes('Select: '));
    });

    test('should allow selecting a value', async function (assert) {
      // given
      const screen = await visit(`/assessments/${assessment.id}/challenges`);

      // when
      await clickByName('saladAriaLabel');
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'good-answer' }));

      // then
      assert.dom('.pix-select-button').hasText('good-answer');
    });

    test.skip('should display the warning dialog if user validates without selecting an answer in input', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      assert.dom(screen.getByText("Pour valider la mission, tu dois terminer l'activité.")).doesNotExist();
      await click(within(document.querySelector('.challenge-actions')).getByRole('button', { name: 'Je continue' }));

      // then
      assert.dom(screen.getByText("Pour valider la mission, tu dois terminer l'activité.")).exists();
    });

    test('should display good answer feedback when user validates with good answer', async function (assert) {
      // given
      const screen = await visit(`/assessments/${assessment.id}/challenges`);

      // when
      await clickByName('saladAriaLabel');
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'good-answer' }));

      await click(within(document.querySelector('.challenge-actions')).getByRole('button', { name: 'Je continue' }));

      // then
      assert.dom(screen.getByText("Bravo ! C'est la bonne réponse.")).exists();
    });
  });
});
