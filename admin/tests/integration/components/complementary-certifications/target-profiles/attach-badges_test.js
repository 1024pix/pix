import { module, test } from 'qunit';
import { render, getByText } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | ComplementaryCertifications::TargetProfiles::AttachBadges', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupMirage(hooks);

  module('Without badges', function () {
    test('it should display an empty table of target profile badges', async function (assert) {
      // given
      // when
      const screen = await render(hbs`<ComplementaryCertifications::TargetProfiles::AttachBadges />`);

      // then
      assert.dom(screen.getByRole('table', { name: 'Liste des résultats thématiques' })).exists();
      const rows = screen.getAllByRole('row');
      assert.strictEqual(rows.length, 1);
      assert.dom(getByText(rows[0], 'ID')).exists();
      assert.dom(getByText(rows[0], 'Nom')).exists();
      assert.dom(getByText(rows[0], 'Niveau')).exists();
    });
  });

  module('When there are badges', function () {

    test('it should display the list of badges', async function (assert) {
      // given
      const badges = [{id: 12, label: 'BoyNextDoor One And Only'}];
      this.set('options', badges);
      // when
      const screen = await render(hbs`<ComplementaryCertifications::TargetProfiles::AttachBadges
        @options={{this.options}}
      />`);

      // then
      assert.strictEqual(screen.getAllByRole('row').length, 2);
      assert.dom(screen.getByRole('row', { name: 'Résultat thématique 12 BoyNextDoor One And Only'})).exists();
    });
  });

  module('Without error', function () {
    test('it should not display an error message', async function (assert) {
      // given
      // when
      const screen = await render(hbs`<ComplementaryCertifications::TargetProfiles::AttachBadges />`);

      // then
      assert.dom(screen.queryByRole('alert')).doesNotExist();
    });
  });

  module('When there is an error', function () {

    test('it should display the error message', async function (assert) {
      // given
      const errorText = 'Erreur';
      this.set('error', errorText);
      // when
      const screen = await render(hbs`<ComplementaryCertifications::TargetProfiles::AttachBadges
        @error={{this.error}}
      />`);

      // then
      const errorMessage = screen.getByRole('alert');
      assert.dom(errorMessage).exists();
      assert.strictEqual(errorMessage.innerText, errorText);
    });
  });
});
