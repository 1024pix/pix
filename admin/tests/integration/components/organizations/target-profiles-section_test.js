import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { clickByName, fillByLabel } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import sinon from 'sinon';

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
    await fillByLabel('ID du ou des profil(s) cible(s)', '1');
    await clickByName('Valider');

    // then
    assert.ok(organization.attachTargetProfiles.calledWith({ 'target-profiles-to-attach': ['1'] }));
  });
});
