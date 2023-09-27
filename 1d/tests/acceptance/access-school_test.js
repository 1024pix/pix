import { clickByText, visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { currentURL, fillIn } from '@ember/test-helpers';
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
    });

    test('should display school page from direct link', async function (assert) {
      // given
      const school = this.server.create('school');
      // when
      const screen = await visit('/schools/MINIPIXOU');
      // then
      assert.dom(screen.getByText(school.name)).exists();
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
});
