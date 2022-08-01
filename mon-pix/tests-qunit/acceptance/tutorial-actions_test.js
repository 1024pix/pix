import { click, find, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticateByEmail } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Tutorial | Actions', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;
  let firstScorecard;
  let competenceId;

  hooks.beforeEach(async function () {
    //given
    user = server.create('user', 'withEmail');
    firstScorecard = user.scorecards.models[0];
    competenceId = firstScorecard.competenceId;
    const assessment = server.create('assessment', 'ofCompetenceEvaluationType');
    server.create('challenge', 'forCompetenceEvaluation', 'QCM');
    server.create('competence-evaluation', { user, competenceId, assessment });

    // when
    await authenticateByEmail(user);
    await visit('/mes-tutos');
  });

  module('Authenticated cases as simple user', function () {
    test('should display tutorial item in competence page with actions', async function (assert) {
      // then
      assert.dom(find('.tutorial-card-v2')).exists();
      assert.dom(find('[aria-label="Marquer ce tuto comme utile"]')).exists();
      assert.dom(find('[aria-label="Enregistrer dans ma liste de tutos"]')).exists();
    });

    test('should toggle evaluation label on click', async function (assert) {
      // given
      await click('[aria-label="Marquer ce tuto comme utile"]');
      assert.dom(find('[aria-label="Ne plus considérer ce tuto comme utile"]')).exists();

      // when
      await click('[aria-label="Ne plus considérer ce tuto comme utile"]');
      // then
      assert.dom(find('[aria-label="Marquer ce tuto comme utile"]')).exists();
    });

    module('when save action is clicked', function () {
      test('should display remove action button', async function (assert) {
        // when
        await click('[aria-label="Enregistrer dans ma liste de tutos"]');

        // then
        assert.dom(find('[aria-label="Retirer de ma liste de tutos"]')).exists();
      });
    });
  });
});
