import { click, fillIn } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { clickByName, visit } from '@1024pix/ember-testing-library';

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
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      // then
      assert.dom('.challenge-item-proposals__response').exists({ count: 1 });
      assert.dom(screen.getByText('Rue de :')).exists();
    });
  });

  module('with text-area format', function (hooks) {
    hooks.beforeEach(async function () {
      assessment = this.server.create('assessment');
      this.server.create('challenge', 'QROCWithTextArea');
    });

    test('should render challenge information and question', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      // then
      assert.dom('.challenge-item-proposals__response').exists({ count: 1 });
      assert.dom(screen.getByText('Rue de :')).exists();
    });

    test('should display answer feedback dialog if user validates after writing the right answer in text area', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/challenges`);
      await fillIn('textarea[data-uid="qroc-proposal-uid"]', 'good-answer');
      await click(screen.getByRole('button', { name: 'Je continue' }));

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
      const screen = await visit(`/assessments/${assessment.id}/challenges`);

      // then
      assert.dom('.challenge-item-proposals__response').exists({ count: 1 });
      assert.dom(screen.getByText('Select:')).exists();
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
  });
});
