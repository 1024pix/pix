import { click, fillIn } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { clickByName, visit } from '@1024pix/ember-testing-library';

module('Acceptance | Displaying a QROCM challenge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let assessment;

  //TODO Ajouter test d'affichage image/embed
  hooks.beforeEach(async function () {
    assessment = this.server.create('assessment');
    this.server.create('challenge', 'QROCM');
  });

  test('should render challenge information and question', async function (assert) {
    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    // then
    assert.dom('.challenge-item-proposals__response').exists({ count: 2 });
    assert.dom(screen.getByText('Trouve les bonnes réponses.')).exists();
  });

  test('should display answer feedback dialog if user validates after writing the right answer in input and selecting the correct option', async function (assert) {
    // when
    const screen = await visit(`/assessments/${assessment.id}/challenges`);
    await fillIn(screen.getByLabelText('prenom'), 'good-answer');
    await clickByName('livre');
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: 'good-answer' }));
    await click(screen.getByRole('button', { name: 'Je continue' }));

    // then
    assert.dom(screen.getByText("Bravo ! C'est la bonne réponse.")).exists();
  });
});
