import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/target-profiles | list-items', function(hooks) {

  setupRenderingTest(hooks);

  hooks.beforeEach(async function() {
    const triggerFiltering = function() {};
    const goToTargetProfilePage = function() {};
    this.triggerFiltering = triggerFiltering;
    this.goToTargetProfilePage = goToTargetProfilePage;
  });

  test('it should display header with name and id', async function(assert) {
    // when
    await render(hbs`<TargetProfiles::ListItems @triggerFiltering={{this.triggerFiltering}} @goToTargetProfilePage={{this.goToTargetProfilePage}}/>`);

    // then
    assert.contains('ID');
    assert.contains('Nom');
  });

  test('if should display search inputs', async function(assert) {
    // when
    await render(hbs`<TargetProfiles::ListItems @triggerFiltering={{this.triggerFiltering}} @goToTargetProfilePage={{this.goToTargetProfilePage}}/>`);

    // then
    assert.dom('input#name').exists();
    assert.dom('input#id').exists();

  });

  test('it should display target profiles list', async function(assert) {
    // given
    const targetProfiles = [
      { id: 1 },
      { id: 2 },
    ];
    targetProfiles.meta = {
      rowCount: 2,
    };
    this.targetProfiles = targetProfiles;

    // when
    await render(hbs`<TargetProfiles::ListItems @targetProfiles={{this.targetProfiles}} @triggerFiltering={{this.triggerFiltering}} @goToTargetProfilePage={{this.goToTargetProfilePage}} />`);

    // then
    assert.dom('[aria-label="Profil cible"]').exists({ count: 2 });
  });

  test('it should display target profile data', async function(assert) {
    // given
    const targetProfiles = [{ id: 123, name: 'Profile Cible 1' }];
    targetProfiles.meta = {
      rowCount: 2,
    };
    this.targetProfiles = targetProfiles;

    // when
    await render(hbs`<TargetProfiles::ListItems @targetProfiles={{this.targetProfiles}} @triggerFiltering={{this.triggerFiltering}} @goToTargetProfilePage={{this.goToTargetProfilePage}}/>`);

    // then
    assert.dom('[aria-label="Profil cible"]').containsText(123);
    assert.dom('[aria-label="Profil cible"]').containsText('Profile Cible 1');
  });
});
