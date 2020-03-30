import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | organization-target-profiles-section', function(hooks) {

  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.attachTargetProfiles = () => {};
  });

  test('it should display the target profile', async function(assert) {
    // given
    const targetProfile1 = EmberObject.create({ id: 123, name: 'target Profile of the Night' });
    const targetProfile2 = EmberObject.create({ id: 456, name: 'target Profile of the Death' });
    this.set('targetProfiles', [ targetProfile1, targetProfile2 ]);

    // when
    await render(hbs`<OrganizationTargetProfilesSection @targetProfiles={{this.targetProfiles}} @attachTargetProfiles={{this.attachTargetProfiles}}/>`);

    // then
    assert.dom('[aria-label="Profil cible"]').exists({ count: 2 });
    assert.dom('[aria-label="Profil cible"]').containsText('123');
    assert.dom('[aria-label="Profil cible"]').containsText('target Profile of the Night');
  });

  test('it should display a field to attach target profiles', async function(assert) {
    assert.expect(1);

    // given
    this.set('targetProfiles', []);
    this.set('targetProfilesToAttach', null);
    this.set('attachTargetProfiles', attachTargetProfiles);

    // when
    await render(hbs`<OrganizationTargetProfilesSection @targetProfiles={{this.targetProfiles}} @targetProfilesToAttach={{this.targetProfilesToAttach}} @attachTargetProfiles={{action this.attachTargetProfiles}}/>`);
    await fillIn('[aria-label="ID du ou des profil(s) cible(s)"]', '1, 2');
    await click('[aria-label="Rattacher un ou plusieurs profil(s) cible(s)"] button');

    //then
    function attachTargetProfiles() {
      assert.equal(this.targetProfilesToAttach, '1, 2');
    }
  });
});
