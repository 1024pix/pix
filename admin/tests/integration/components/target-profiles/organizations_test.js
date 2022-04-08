import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillByLabel, clickByName, render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | TargetProfiles::Organizations', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.triggerFiltering = () => {};
    this.goToOrganizationPage = () => {};
  });

  test('it should display the organizations', async function (assert) {
    // given
    const organization1 = EmberObject.create({ id: 123, name: 'Orga1', externalId: 'O1' });
    const organization2 = EmberObject.create({ id: 456, name: 'Orga2', externalId: 'O2' });
    const organizations = [organization1, organization2];
    organizations.meta = { page: 1, pageSize: 1 };
    this.organizations = organizations;

    // when
    const screen = await render(
      hbs`<TargetProfiles::Organizations @organizations={{this.organizations}} @goToOrganizationPage={{this.goToOrganizationPage}} @triggerFiltering={{this.triggerFiltering}} />`
    );

    // then
    assert.dom(screen.getByText('Orga1')).exists();
    assert.dom(screen.getByText('Orga2')).exists();
  });

  test('it should display organization informations', async function (assert) {
    // given
    const organization1 = EmberObject.create({ id: 123, name: 'Orga1', externalId: 'O1' });
    const organizations = [organization1];
    organizations.meta = { page: 1, pageSize: 1 };
    this.organizations = organizations;

    // when
    const screen = await render(
      hbs`<TargetProfiles::Organizations @organizations={{this.organizations}} @goToOrganizationPage={{this.goToOrganizationPage}} @triggerFiltering={{this.triggerFiltering}} />`
    );

    // then
    assert.dom(screen.getByText('Orga1')).exists();
    assert.dom(screen.getByText('123')).exists();
    assert.dom(screen.getByText('O1')).exists();
  });

  test('it displays a message when there is no organizations', async function (assert) {
    // given
    const organizations = [];
    organizations.meta = { page: 1, pageSize: 1 };
    this.organizations = [];

    // when
    const screen = await render(
      hbs`<TargetProfiles::Organizations @organizations={{this.organizations}} @goToOrganizationPage={{this.goToOrganizationPage}} @triggerFiltering={{this.triggerFiltering}}/>`
    );

    assert.dom(screen.getByText('Aucun résultat')).exists();
  });

  test('it should display a field to attach organizations', async function (assert) {
    // given
    this.organizations = [];

    // when
    await render(
      hbs`<TargetProfiles::Organizations @organizations={{this.organizations}} @goToOrganizationPage={{this.goToOrganizationPage}} @triggerFiltering={{this.triggerFiltering}}/>`
    );
    await fillByLabel('Rattacher une ou plusieurs organisation(s)', '1, 2');
    await clickByName('Valider le rattachement');

    assert.dom('[placeholder="1, 2"]').hasValue('1, 2');
  });

  test('it should display a field to attach organizations from an existing target profile', async function (assert) {
    // given
    this.organizations = [];

    // when
    await render(
      hbs`<TargetProfiles::Organizations @organizations={{this.organizations}} @goToOrganizationPage={{this.goToOrganizationPage}} @triggerFiltering={{this.triggerFiltering}}/>`
    );
    await fillByLabel("Rattacher les organisations d'un profil cible existant", 1);
    await clickByName('Valider le rattachement à partir de ce profil cible');

    assert.dom('[placeholder="1135"]').hasValue('1');
  });

  test('it should disable buttons when the inputs are empty', async function (assert) {
    // given
    const organizations = [];
    organizations.meta = { page: 1, pageSize: 1 };
    this.organizations = [];

    // when
    const screen = await render(
      hbs`<TargetProfiles::Organizations @organizations={{this.organizations}} @goToOrganizationPage={{this.goToOrganizationPage}} @triggerFiltering={{this.triggerFiltering}} />`
    );

    // then
    assert.dom(screen.getByLabelText('Valider le rattachement')).isDisabled();
    assert.dom(screen.getByLabelText('Valider le rattachement à partir de ce profil cible')).isDisabled();
  });
});
