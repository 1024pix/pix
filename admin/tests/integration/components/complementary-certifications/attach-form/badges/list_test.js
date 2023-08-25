import { module, test } from 'qunit';
import { render, getByText } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import { fillIn } from '@ember/test-helpers';
import sinon from 'sinon';

module('Integration | Component | ComplementaryCertifications::AttachForm::Badges::List', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupMirage(hooks);

  module('Without badges', function () {
    test('it should display an empty table of target profile badges', async function (assert) {
      // given
      // when
      const screen = await render(hbs`<ComplementaryCertifications::AttachForm::Badges::List />`);

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
      const badges = [{ id: 12, label: 'BoyNextDoor One And Only' }];
      this.set('options', badges);
      this.set('noop', () => {});

      // when
      const screen = await render(hbs`<ComplementaryCertifications::AttachForm::Badges::List
        @options={{this.options}}
        @onUpdateLevel={{this.noop}}
      />`);

      // then
      assert.strictEqual(screen.getAllByRole('row').length, 2);
      assert.dom(screen.getByRole('row', { name: 'Résultat thématique 12 BoyNextDoor One And Only' })).exists();
      assert.dom(screen.getByRole('spinbutton')).exists();
    });

    test('it should call trigger on level update', async function (assert) {
      // given
      const badges = [{ id: 12, label: 'BoyNextDoor One And Only' }];
      this.set('options', badges);
      const onUpdateLevel = sinon.stub();
      this.set('onUpdateLevel', onUpdateLevel);

      // when
      const screen = await render(hbs`<ComplementaryCertifications::AttachForm::Badges::List
        @options={{this.options}}
        @onUpdateLevel={{this.onUpdateLevel}}
      />`);

      const input = screen.getByRole('spinbutton');
      await fillIn(input, '1');

      // then
      assert.ok(onUpdateLevel.calledOnceWith('12', '1'));
    });
  });

  module('Without error', function () {
    test('it should not display an error message', async function (assert) {
      // given
      // when
      const screen = await render(hbs`<ComplementaryCertifications::AttachForm::Badges::List />`);

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
      const screen = await render(hbs`<ComplementaryCertifications::AttachForm::Badges::List
        @error={{this.error}}
      />`);

      // then
      const errorMessage = screen.getByRole('alert');
      assert.dom(errorMessage).exists();
      assert.strictEqual(errorMessage.innerText, errorText);
    });
  });
});
