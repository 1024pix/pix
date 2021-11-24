import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import fillInByLabel from '../../../helpers/extended-ember-test-helpers/fill-in-by-label';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';

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
    await render(
      hbs`<TargetProfiles::Organizations @organizations={{this.organizations}} @goToOrganizationPage={{this.goToOrganizationPage}} @triggerFiltering={{this.triggerFiltering}} />`
    );

    // then
    assert.contains('Orga1');
    assert.contains('Orga2');
  });

  test('it should display organization informations', async function (assert) {
    // given
    const organization1 = EmberObject.create({ id: 123, name: 'Orga1', externalId: 'O1' });
    const organizations = [organization1];
    organizations.meta = { page: 1, pageSize: 1 };
    this.organizations = organizations;

    // when
    await render(
      hbs`<TargetProfiles::Organizations @organizations={{this.organizations}} @goToOrganizationPage={{this.goToOrganizationPage}} @triggerFiltering={{this.triggerFiltering}} />`
    );

    // then
    assert.contains('Orga1');
    assert.contains('123');
    assert.contains('O1');
  });

  test('it displays a message when there is no organizations', async function (assert) {
    // given
    const organizations = [];
    organizations.meta = { page: 1, pageSize: 1 };
    this.organizations = [];

    // when
    await render(
      hbs`<TargetProfiles::Organizations @organizations={{this.organizations}} @goToOrganizationPage={{this.goToOrganizationPage}} @triggerFiltering={{this.triggerFiltering}}/>`
    );

    assert.contains('Aucun résultat');
  });

  test('it should display a field to attach organizations', async function (assert) {
    // given
    this.organizations = [];

    // when
    await render(
      hbs`<TargetProfiles::Organizations @organizations={{this.organizations}} @goToOrganizationPage={{this.goToOrganizationPage}} @triggerFiltering={{this.triggerFiltering}}/>`
    );
    await fillInByLabel('Rattacher une ou plusieurs organisation(s)', '1, 2');
    await clickByLabel('Valider le rattachement');

    assert.dom('[placeholder="1, 2"]').hasValue('1, 2');
  });

  test('it should display a field to attach organizations from an existing target profile', async function (assert) {
    // given
    this.organizations = [];

    // when
    await render(
      hbs`<TargetProfiles::Organizations @organizations={{this.organizations}} @goToOrganizationPage={{this.goToOrganizationPage}} @triggerFiltering={{this.triggerFiltering}}/>`
    );
    await fillInByLabel("Rattacher les organisations d'un profil cible existant", 1);
    await clickByLabel('Valider le rattachement à partir de ce profil cible');

    assert.dom('[placeholder="1135"]').hasValue('1');
  });

  test('it should disable buttons when the inputs are empty', async function (assert) {
    // given
    const organizations = [];
    organizations.meta = { page: 1, pageSize: 1 };
    this.organizations = [];

    // when
    await render(
      hbs`<TargetProfiles::Organizations @organizations={{this.organizations}} @goToOrganizationPage={{this.goToOrganizationPage}} @triggerFiltering={{this.triggerFiltering}} />`
    );

    // then
    assert.dom('[aria-label="Valider le rattachement"]').isDisabled();
    assert.dom('[aria-label="Valider le rattachement à partir de ce profil cible"]').isDisabled();
  });
});
