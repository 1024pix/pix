import { visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Checkpoint', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  let assessment;

  hooks.beforeEach(function () {
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
  });

  module('With answers', function (hooks) {
    const NB_ANSWERS = 3;

    hooks.beforeEach(function () {
      for (let i = 0; i < NB_ANSWERS; ++i) {
        const challenge = server.create('challenge', 'forCompetenceEvaluation');
        server.create('answer', {
          value: 'SomeAnswer',
          result: 'ko',
          challenge,
          assessment,
        });
      }
    });

    test('should display questions and links to solutions', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/checkpoint`);

      // then
      assert.dom(screen.getByText('Vous avez effectué 20 % de votre parcours.')).exists();
      assert.dom(screen.getByRole('heading', { name: t('pages.checkpoint.answers.header') })).exists();
      assert.strictEqual(screen.getAllByRole('button', { name: 'Réponses et tutos' }).length, NB_ANSWERS);
      assert.dom(screen.getByRole('link', { name: 'Continuer' })).exists();
      assert
        .dom(screen.queryByText(t('pages.checkpoint.answers.already-finished.explanation.sentence1')))
        .doesNotExist();
    });

    test('should not call /assessments/:id/next when leaving checkpoint', async function (assert) {
      // given
      const screen = await visit(`/assessments/${assessment.id}/checkpoint`);

      // when
      const continueButtons = screen.getAllByRole('link', { name: 'Continuer' });
      await click(continueButtons[0]);

      // then
      const requests = server.pretender.handledRequests;
      const requestsToGetNextChallenge = requests.filter(({ url }) => url.includes('/next'));
      assert.strictEqual(
        requestsToGetNextChallenge.length,
        0,
        'Request to GET /assessments/:id/next should not be done',
      );
    });
  });

  module('Without answers', function () {
    test('should display a message indicating that there is no answers to provide', async function (assert) {
      // when
      const screen = await visit(`/assessments/${assessment.id}/checkpoint?finalCheckpoint=true`);

      // then
      assert.dom('.result-item').doesNotExist();
      assert.dom(screen.getByRole('heading', { name: t('pages.checkpoint.answers.already-finished.info') })).exists();
      assert.dom(screen.getByText(t('pages.checkpoint.answers.already-finished.explanation.sentence1'))).exists();
      assert.dom(screen.getByText(t('pages.checkpoint.answers.already-finished.explanation.sentence2'))).exists();

      assert.ok(screen.getByRole('link', { name: t('pages.checkpoint.actions.next-page.results') }));
    });
  });

  module('When user is anonymous', function () {
    test('should not display home link', async function (assert) {
      //given
      const user = server.create('user', 'withEmail', {
        isAnonymous: true,
      });
      await authenticate(user);

      // when
      const screen = await visit(`/assessments/${assessment.id}/checkpoint?finalCheckpoint=true`);

      // then
      assert.dom(screen.queryByRole('button', { name: 'Quitter' })).doesNotExist();
    });
  });
});
