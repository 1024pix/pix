import { module, test } from 'qunit';
import { render, getByText } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import { fillIn } from '@ember/test-helpers';
import sinon from 'sinon';

module('Integration | Component | complementary-certifications/attach-badges/list', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupMirage(hooks);

  module('Without badges', function () {
    test('it should display an empty table of target profile badges', async function (assert) {
      // given
      // when
      const screen = await render(hbs`<ComplementaryCertifications::AttachBadges::Badges::List />`);

      // then
      assert.dom(screen.getByRole('table', { name: 'Liste des résultats thématiques' })).exists();
      const rows = screen.getAllByRole('row');
      assert.strictEqual(rows.length, 1);
      assert.dom(getByText(rows[0], 'ID')).exists();
      assert.dom(getByText(rows[0], 'Nom')).exists();
      assert.dom(getByText(rows[0], 'Niveau')).exists();
      assert.dom(getByText(rows[0], 'Image svg certificat Pix App')).exists();
      assert.dom(getByText(rows[0], 'Label du certificat')).exists();
      assert.dom(getByText(rows[0], 'Macaron de l\'attestation PDF')).exists();
      assert.dom(getByText(rows[0], 'Message du certificat')).exists();
      assert.dom(getByText(rows[0], 'Message temporaire certificat')).exists();
    });
  });

  module('When there are badges', function () {
    test('it should display the list of badges', async function (assert) {
      // given
      const badges = [{ id: 12, label: 'BoyNextDoor One And Only' }];
      this.set('options', badges);
      this.set('noop', () => {});

      // when
      const screen = await render(hbs`<ComplementaryCertifications::AttachBadges::Badges::List
        @options={{this.options}}
        @onBadgeUpdated={{this.noop}}
      />`);

      // then
      assert.strictEqual(screen.getAllByRole('row').length, 2);
      assert.dom(screen.getByRole('row', { name: 'Résultat thématique 12 BoyNextDoor One And Only' })).exists();
      assert.dom(screen.getByText('12')).exists();
      assert.dom(screen.getByText('BoyNextDoor One And Only')).exists();
      assert.dom(screen.getByRole('spinbutton', {name: 'niveau'})).exists();
      assert.dom(screen.getByRole('textbox', {name: 'image certificat Pix App'})).exists();
      assert.dom(screen.getByRole('textbox', {name: 'label du certificat'})).exists();
      assert.dom(screen.getByRole('textbox', {name: 'macaron du certificat'})).exists();
      assert.dom(screen.getByRole('textbox', {name: 'message du certificat'})).exists();
      assert.dom(screen.getByRole('textbox', {name: 'message temporaire du certificat'})).exists();
    });

    test('it should call trigger action when a badge is updated', async function (assert) {
      // given
      const badges = [{ id: 12, label: 'BoyNextDoor One And Only' }];
      this.set('options', badges);
      const onBadgeUpdated = sinon.stub();
      this.set('onBadgeUpdated', onBadgeUpdated);

      // when
      const screen = await render(hbs`<ComplementaryCertifications::AttachBadges::Badges::List
        @options={{this.options}}
        @onBadgeUpdated={{this.onBadgeUpdated}}
      />`);

      const input = screen.getByRole('textbox', {name: 'image certificat Pix App'});
      await fillIn(input, 'image');

      // then
      assert.ok(onBadgeUpdated.calledOnceWith({
        badgeId: 12,
        fieldName: 'certificate-image',
        fieldValue: 'image'
      }));
    });
  });

  module('Without error', function () {
    test('it should not display an error message', async function (assert) {
      // given
      // when
      const screen = await render(hbs`<ComplementaryCertifications::AttachBadges::Badges::List />`);

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
      const screen = await render(hbs`<ComplementaryCertifications::AttachBadges::Badges::List
        @error={{this.error}}
      />`);

      // then
      const errorMessage = screen.getByRole('alert');
      assert.dom(errorMessage).exists();
      assert.strictEqual(errorMessage.innerText, errorText);
    });
  });
});
