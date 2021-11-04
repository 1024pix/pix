import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import sinon from 'sinon';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';

module('Integration | Component | organizations/target-profiles-section', function (hooks) {
  setupRenderingTest(hooks);

  test('it disable the button when the input is empty', async function (assert) {
    // given
    const organization = EmberObject.create({
      id: 1,
      targetProfiles: [],
      attachTargetProfiles: sinon.stub(),
    });
    this.set('organization', organization);

    // when
    await render(hbs`<Organizations::TargetProfilesSection @organization={{organization}} />`);

    // then
    assert.dom('button').isDisabled();
  });

  test('it calls the organization action when the input is not empty and user clicks on button', async function (assert) {
    // given
    const organization = EmberObject.create({
      id: 1,
      targetProfiles: [],
      attachTargetProfiles: sinon.stub(),
    });
    this.set('organization', organization);

    // when
    await render(hbs`<Organizations::TargetProfilesSection @organization={{organization}} />`);
    await fillIn('[aria-label="ID du ou des profil(s) cible(s)"]', '1');
    await clickByLabel('Valider');

    // then
    assert.ok(organization.attachTargetProfiles.calledWith({ 'target-profiles-to-attach': ['1'] }));
  });
});
