import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { triggerEvent } from '@ember/test-helpers';
import { render, clickByName } from '@1024pix/ember-testing-library';
import sinon from 'sinon';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | TargetProfiles::CreateTargetProfileForm', function (hooks) {
  setupRenderingTest(hooks);

  let targetProfile;
  let onSubmit;
  let onCancel;

  hooks.beforeEach(function () {
    targetProfile = {
      name: '',
      imageUrl: '',
      ownerOrganizationId: '',
      isPublic: false,
      comment: '',
      category: 'OTHER',
    };

    onSubmit = sinon.stub();
    const onSubmitWrapper = function (e) {
      e.preventDefault();
      onSubmit();
    };
    onCancel = sinon.stub();

    const store = this.owner.lookup('service:store');
    const frameworks = [store.createRecord('framework', { id: 'framework1', name: 'Pix', areas: [] })];

    this.set('targetProfile', targetProfile);
    this.set('onSubmit', onSubmitWrapper);
    this.set('onCancel', onCancel);
    this.set('frameworks', frameworks);
  });

  test('it should display the items', async function (assert) {
    // when
    const screen = await render(hbs`<TargetProfiles::CreateTargetProfileForm
  @targetProfile={{this.targetProfile}}
  @frameworks={{this.frameworks}}
  @onSubmit={{this.onSubmit}}
  @onCancel={{this.onCancel}}
/>`);

    // then
    assert.dom(screen.getByLabelText(/Nom/)).exists();
    assert.dom(screen.getByLabelText('Public :')).exists();
    assert.dom(screen.getByLabelText(/Identifiant de l'organisation de référence/)).exists();
    assert.dom(screen.getByLabelText("Lien de l'image du profil cible :", { exact: false })).exists();
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Créer le profil cible' })).exists();
    assert.dom(screen.getByLabelText('Commentaire (usage interne) :')).exists();
  });

  test('it should call onSubmit when form is valid', async function (assert) {
    // when
    await render(hbs`<TargetProfiles::CreateTargetProfileForm
  @targetProfile={{this.targetProfile}}
  @frameworks={{this.frameworks}}
  @refreshAreas={{this.refreshAreas}}
  @onSubmit={{this.onSubmit}}
  @onCancel={{this.onCancel}}
/>`);

    await triggerEvent('form', 'submit');

    // then
    assert.ok(onSubmit.called);
  });

  test('it should call onCancel when form is cancel', async function (assert) {
    // when
    await render(hbs`<TargetProfiles::CreateTargetProfileForm
  @targetProfile={{this.targetProfile}}
  @frameworks={{this.frameworks}}
  @refreshAreas={{this.refreshAreas}}
  @onSubmit={{this.onSubmit}}
  @onCancel={{this.onCancel}}
/>`);

    await clickByName('Annuler');

    // then
    assert.ok(onCancel.called);
  });
});
