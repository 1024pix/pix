import { clickByText, visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { currentURL, fillIn, click } from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';
import identifyLearner from '../helpers/identify-learner';
module('Acceptance | School', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  hooks.afterEach(async function () {
    localStorage.clear();
  });

  module('When the user is not identified', function () {
    test('should redirect to organization-code', async function (assert) {
      try {
        await visit('/');
      } catch (error) {
        const { message } = error;
        if (message !== 'TransitionAborted') {
          throw error;
        }
      }
      assert.strictEqual(currentURL(), '/organization-code');
    });
  });

  module('When the user is identified', function () {
    test('should display mission page', async function (assert) {
      identifyLearner({ firstName: 'Amanda' }, this.owner);
      try {
        await visit('/');
      } catch (error) {
        const { message } = error;
        if (message !== 'TransitionAborted') {
          throw error;
        }
      }
      assert.strictEqual(currentURL(), '/');
    });
  });

  module('with valid school code', function () {
    test('redirect to school page after filling code', async function (assert) {
      // given
      const school = this.server.create('school');
      // when
      const screen = await visit('/organization-code');

      const code = ['M', 'I', 'N', 'I', 'P', 'I', 'X', 'O', 'U'];

      code.forEach((element, index) => fillIn(screen.getByLabelText(`Champ numéro ${index + 1}`), element));
      await clickByText(this.intl.t('pages.home.go-to-school'));
      // then
      assert.strictEqual(currentURL(), '/schools/MINIPIXOU');
      assert.dom(screen.getByText(school.name)).exists();
      assert.dom(screen.getByRole('link', { name: 'CM2 A' })).exists();
      assert.dom(screen.getByRole('link', { name: 'CM2-B' })).exists();
    });

    test('should display school page from direct link', async function (assert) {
      // given
      const school = this.server.create('school');
      // when
      const screen = await visit('/schools/MINIPIXOU');
      // then
      assert.dom(screen.getByText(school.name)).exists();
      assert.dom(screen.getByRole('link', { name: 'CM2 A' })).exists();
      assert.dom(screen.getByRole('link', { name: 'CM2-B' })).exists();
    });
  });

  module('with invalid school code', function () {
    test('should redirect to error page', async function (assert) {
      // given
      this.server.create('school');
      // when
      const screen = await visit('/schools/INVALID00');
      // then
      assert.dom(screen.getByText(this.intl.t('pages.error.message'))).exists();
    });
  });

  module('access to the list of the learners for a division', function () {
    test('redirect the list of the learners after select a division', async function (assert) {
      // given
      const division = 'CM2-B';
      this.server.create('school');
      // when
      const screen = await visit('/schools/MINIPIXOU');
      await click(screen.getByRole('link', { name: division }));

      // then
      assert.strictEqual(currentURL(), '/schools/MINIPIXOU/students?division=CM2-B');
      assert.dom(screen.getByText(division)).exists();
      assert.dom(screen.getByRole('button', { name: 'Sara Crewe' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Maya Labeille' })).exists();
    });
  });

  module('access to the list of the learners for a division with special characters', function () {
    test('redirect the list of the learners after select a division', async function (assert) {
      // given
      const division = 'CM2 A';
      this.server.create('school');
      // when
      const screen = await visit('/schools/MINIPIXOU');
      await click(screen.getByRole('link', { name: division }));

      // then
      assert.strictEqual(currentURL(), '/schools/MINIPIXOU/students?division=CM2%20A');
      assert.dom(screen.getByText(division)).exists();
      assert.dom(screen.getByRole('button', { name: 'Mickey Mouse' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Donald Duck' })).exists();
    });
  });

  module('access to the list of the missions', function () {
    test('redirect to the list of the missions after select the learner name', async function (assert) {
      // given
      this.server.create('school');
      // when
      const screen = await visit('/schools/MINIPIXOU');
      await click(screen.getByRole('link', { name: 'CM2-B' }));
      await click(screen.getByRole('button', { name: 'Maya Labeille' }));

      // then
      assert.strictEqual(currentURL(), '/');
    });
    test('should save the selected user as current learner', async function (assert) {
      // given
      this.server.create('school');
      const currentLearner = this.owner.lookup('service:currentLearner');
      // when
      const screen = await visit('/schools/MINIPIXOU');
      await click(screen.getByRole('link', { name: 'CM2-B' }));
      await click(screen.getByRole('button', { name: 'Maya Labeille' }));

      // then
      assert.deepEqual(currentLearner.learner, {
        id: 1,
        schoolUrl: '/schools/MINIPIXOU',
      });
    });
  });

  module('When there is no queryparams in the division url', function () {
    test('redirect to school page', async function (assert) {
      // given
      this.server.create('school');

      // when
      //Lorsqu'on souhaite tester un transitioTo, on doit utiliser un try/catch 🤯
      //https://github.com/emberjs/ember-test-helpers/issues/332
      try {
        await visit('/schools/MINIPIXOU/students');
      } catch (error) {
        const { message } = error;
        if (message !== 'TransitionAborted') {
          throw error;
        }
      }

      // then
      assert.strictEqual(currentURL(), '/schools/MINIPIXOU');
    });
  });

  module('Remove current learner', function () {
    test('when the user change name after having selected one', async function (assert) {
      this.server.create('school');
      const currentLearner = this.owner.lookup('service:currentLearner');
      const screen = await visit('/schools/MINIPIXOU/students?division=CM2%20A');
      await click(screen.getByRole('button', { name: 'Mickey Mouse' }));

      // when
      await visit('/schools/MINIPIXOU/students?division=CM2%20A');

      // then
      assert.strictEqual(currentLearner.learner, null);
    });

    test('when the user go back to organization-code page after having selected a learner', async function (assert) {
      this.server.create('school');
      const currentLearner = this.owner.lookup('service:currentLearner');
      // when
      const screen = await visit('/schools/MINIPIXOU/students?division=CM2%20A');
      await click(screen.getByRole('button', { name: 'Mickey Mouse' }));
      await visit('/organization-code');

      // then
      assert.strictEqual(currentLearner.learner, null);
    });
  });
});
