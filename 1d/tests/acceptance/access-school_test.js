import { clickByText, visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { currentURL, fillIn, click } from '@ember/test-helpers';
import { setupIntl } from 'ember-intl/test-support';
module('Acceptance | School', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('with valid school code', function () {
    test('redirect to school page after filling code', async function (assert) {
      // given
      const school = this.server.create('school');
      // when
      const screen = await visit('/');
      const code = ['M', 'I', 'N', 'I', 'P', 'I', 'X', 'O', 'U'];

      code.forEach((element, index) => fillIn(screen.getByLabelText(`Champ numéro ${index + 1}`), element));
      await clickByText(this.intl.t('pages.home.go-to-school'));
      // then
      assert.strictEqual(currentURL(), '/schools/MINIPIXOU');
      assert.dom(screen.getByText(school.name)).exists();
      assert.dom(screen.getByRole('link', { name: 'CM2-A' })).exists();
      assert.dom(screen.getByRole('link', { name: 'CM2-B' })).exists();
    });

    test('should display school page from direct link', async function (assert) {
      // given
      const school = this.server.create('school');
      // when
      const screen = await visit('/schools/MINIPIXOU');
      // then
      assert.dom(screen.getByText(school.name)).exists();
      assert.dom(screen.getByRole('link', { name: 'CM2-A' })).exists();
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
      const division = 'CM2-A';
      this.server.create('school');
      // when
      const screen = await visit('/schools/MINIPIXOU');
      await click(screen.getByRole('link', { name: division }));

      // then
      assert.strictEqual(currentURL(), '/schools/MINIPIXOU/division?division=CM2-A');
      assert.dom(screen.getByText(division)).exists();
      assert.dom(screen.getByRole('link', { name: 'Mickey Mouse' })).exists();
      assert.dom(screen.getByRole('link', { name: 'Donald Duck' })).exists();
    });
  });

  module('access to the list of the missions', function () {
    test('redirect to the list of the missions after select the learner name', async function (assert) {
      // given
      this.server.create('school');
      // when
      const screen = await visit('/schools/MINIPIXOU');
      await click(screen.getByRole('link', { name: 'CM2-A' }));
      await click(screen.getByRole('link', { name: 'Donald Duck' }));

      // then
      assert.strictEqual(currentURL(), '/missions');
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
        await visit('/schools/MINIPIXOU/division');
      } catch (e) {
        console.error(e);
      }

      // then
      assert.strictEqual(currentURL(), '/schools/MINIPIXOU');
    });
  });
});
