import { module, test } from 'qunit';
import { render, getByText, queryByText, getByTextWithHtml } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import { fillIn } from '@ember/test-helpers';
import sinon from 'sinon';

module('Integration | Component | complementary-certifications/attach-badges/list', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupMirage(hooks);

  test('[a11y] it should display a message that some inputs are required', async function (assert) {
    // given & when
    await render(hbs`<ComplementaryCertifications::AttachBadges::Badges::List />`);

    // then
    assert.dom(getByTextWithHtml(this.intl.t('common.forms.mandatory-fields'))).exists();
  });

  module('Without badges', function () {
    test('it should display an empty table of target profile badges', async function (assert) {
      // given & when
      const screen = await render(hbs`<ComplementaryCertifications::AttachBadges::Badges::List />`);

      // then
      assert.dom(screen.getByRole('table', { name: 'Liste des résultats thématiques' })).exists();
      const rows = screen.getAllByRole('row');
      assert.strictEqual(rows.length, 1);
    });
  });

  module('when the complementary certification has an external jury', function () {
    test('it should display all columns', async function (assert) {
      // given & when
      const screen = await render(
        hbs`<ComplementaryCertifications::AttachBadges::Badges::List @hasExternalJury={{true}} />`,
      );

      // then
      const [firstRow] = screen.getAllByRole('row');
      assert.dom(getByText(firstRow, 'ID')).exists();
      assert.dom(getByText(firstRow, 'Nom')).exists();
      assert.dom(getByText(firstRow, 'Niveau')).exists();
      assert.dom(getByText(firstRow, 'Nombre de pix minimum')).exists();
      assert.dom(getByText(firstRow, 'Image svg certificat Pix App')).exists();
      assert.dom(getByText(firstRow, 'Label du certificat')).exists();
      assert.dom(getByText(firstRow, "Macaron de l'attestation PDF")).exists();
      assert.dom(getByText(firstRow, 'Message du certificat')).exists();
      assert.dom(getByText(firstRow, 'Message temporaire certificat')).exists();
    });

    module('When there are badges', function () {
      test('it should display the list of badges with required inputs', async function (assert) {
        // given
        const badges = [{ id: 12, label: 'BoyNextDoor' }];
        this.set('options', badges);
        this.set('noop', () => {});

        // when
        const screen = await render(hbs`<ComplementaryCertifications::AttachBadges::Badges::List
        @options={{this.options}}
        @onBadgeUpdated={{this.noop}}
        @hasExternalJury={{true}}
      />`);

        // then
        assert.strictEqual(screen.getAllByRole('row').length, 2);
        assert.dom(screen.getByRole('row', { name: 'Résultat thématique 12 BoyNextDoor' })).exists();
        assert.dom(screen.getByText('12')).exists();
        assert.dom(screen.getByText('BoyNextDoor')).exists();
        assert.dom(screen.getByRole('spinbutton', { name: '12 BoyNextDoor Niveau' })).hasAttribute('required');
        assert
          .dom(screen.getByRole('spinbutton', { name: '12 BoyNextDoor Nombre de pix minimum' }))
          .doesNotHaveAttribute('required');
        assert
          .dom(screen.getByRole('textbox', { name: '12 BoyNextDoor Image svg certificat Pix App' }))
          .hasAttribute('required');
        assert
          .dom(screen.getByRole('textbox', { name: '12 BoyNextDoor Label du certificat' }))
          .hasAttribute('required');
        assert
          .dom(screen.getByRole('textbox', { name: "12 BoyNextDoor Macaron de l'attestation PDF" }))
          .hasAttribute('required');
        assert
          .dom(screen.getByRole('textbox', { name: '12 BoyNextDoor Message du certificat' }))
          .hasAttribute('required');
        assert
          .dom(screen.getByRole('textbox', { name: '12 BoyNextDoor Message temporaire certificat' }))
          .hasAttribute('required');
      });
    });
  });

  module('when the complementary certification has no external jury', function () {
    test('it should not display temporary-certificate-message and certificate-message columns', async function (assert) {
      // given & when
      const screen = await render(
        hbs`<ComplementaryCertifications::AttachBadges::Badges::List @hasExternalJury={{false}} />`,
      );

      // then
      const [firstRow] = screen.getAllByRole('row');
      assert.dom(queryByText(firstRow, 'Message du certificat')).doesNotExist();
      assert.dom(queryByText(firstRow, 'Message temporaire certificat')).doesNotExist();
    });

    module('When there are badges', function () {
      test('it should not display temporary-certificate-message and certificate-message inputs', async function (assert) {
        // given
        const badges = [{ id: 12, label: 'BadgeLabel' }];
        this.set('options', badges);
        this.set('noop', () => {});

        // when
        const screen = await render(hbs`<ComplementaryCertifications::AttachBadges::Badges::List
        @options={{this.options}}
        @onBadgeUpdated={{this.noop}}
        @hasExternalJury={{false}}
      />`);

        // then
        assert.dom(screen.queryByText('textbox', { name: '12 BadgeLabel Message du certificat' })).doesNotExist();
        assert
          .dom(screen.queryByText('textbox', { name: '12 BadgeLabel Message temporaire certificat' }))
          .doesNotExist();
      });
    });
  });

  module('When there are badges', function () {
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

      const input = screen.getByRole('textbox', { name: '12 BoyNextDoor One And Only Image svg certificat Pix App' });
      await fillIn(input, 'image');

      // then
      assert.ok(
        onBadgeUpdated.calledOnceWith({
          badgeId: 12,
          fieldName: 'certificate-image',
          fieldValue: 'image',
        }),
      );
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
