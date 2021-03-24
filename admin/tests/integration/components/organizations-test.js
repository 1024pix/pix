import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import sinon from 'sinon';

module('Integration | Component | target-profiles organizations', (hooks) => {

  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.attachOrganizations = () => {};
    this.triggerFiltering = () => {};
    this.goToOrganizationPage = () => {};
  });

  test('it should display the organizations', async function(assert) {
    // given
    const organization1 = EmberObject.create({ id: 123, name: 'Orga1', externalId: 'O1' });
    const organization2 = EmberObject.create({ id: 456, name: 'Orga2', externalId: 'O2' });
    const organizations = [organization1, organization2];
    organizations.meta = { page: 1, pageSize: 1 };
    this.set('organizations', organizations);

    // when
    await render(hbs`<TargetProfiles::Organizations @organizations={{this.organizations}} @attachOrganizations={{this.attachOrganizations}} @goToOrganizationPage={{this.goToOrganizationPage}} @triggerFiltering={{this.triggerFiltering}} />`);

    // then
    assert.dom('[aria-label="Organisation"]').exists({ count: 2 });
    assert.dom('[aria-label="Organisation"]').containsText('Orga1');
    assert.dom('[aria-label="Organisation"]').containsText('O1');
  });

  test('it displays a message when there is no organizations', async function(assert) {
    // given
    const organizations = [];
    organizations.meta = { page: 1, pageSize: 1 };
    this.set('organizations', organizations);

    // when
    await render(hbs`<TargetProfiles::Organizations @organizations={{this.organizations}} @organizationsToAttach={{this.organizationsToAttach}} @attachOrganizations={{action this.attachOrganizations}} @goToOrganizationPage={{this.goToOrganizationPage}} @triggerFiltering={{this.triggerFiltering}}/>`);

    assert.dom('.content-text').containsText('Aucun résultat');
  });

  test('it should display a field to attach organizations', async function(assert) {
    assert.expect(1);
    const attachOrganizations = sinon.stub();
    // given
    const organizations = [];
    organizations.meta = { page: 1, pageSize: 1 };
    this.set('organizations', organizations);
    this.set('organizationsToAttach', null);
    this.set('attachOrganizations', attachOrganizations);

    // when
    await render(hbs`<TargetProfiles::Organizations @organizations={{this.organizations}} @organizationsToAttach={{this.organizationsToAttach}} @attachOrganizations={{action this.attachOrganizations}} @goToOrganizationPage={{this.goToOrganizationPage}} @triggerFiltering={{this.triggerFiltering}}/>`);
    await fillIn('[aria-label="ID de ou des organisation(s)"]', '1, 2');
    await click('[aria-label="Rattacher une ou plusieurs organisation(s)"] button');

    sinon.assert.called(attachOrganizations);
    assert.equal(this.organizationsToAttach, '1, 2');
  });
});
