import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { selectChoose } from 'ember-power-select/test-support/helpers';

module('Integration | Component | organizations/form', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.onSubmit = () => {};
    this.onCancel = () => {};
    this.organization = EmberObject.create();
  });

  test('it renders', async function (assert) {
    // when
    const screen = await render(
      hbs`<Organizations::Form @organization={{this.organization}} @onSubmit={{action onSubmit}} @onCancel={{action onCancel}} />`
    );

    // then
    assert.dom(screen.getByRole('textbox', { name: 'Nom :' })).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Lien vers la documentation :' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Ajouter' })).exists();
  });

  module('#selectOrganizationType', function () {
    test('should update attribute organization.type', async function (assert) {
      // given
      await render(
        hbs`<Organizations::Form @organization={{this.organization}} @onSubmit={{action onSubmit}} @onCancel={{action onCancel}} />`
      );

      // when
      await selectChoose('#organizationTypeSelector', 'Établissement scolaire');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(this.organization.type, 'SCO');
      assert.dom('.ember-power-select-selected-item').hasText('Établissement scolaire');
    });
  });
});
