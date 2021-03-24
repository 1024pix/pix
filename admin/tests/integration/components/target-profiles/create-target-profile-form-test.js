import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, triggerEvent, render } from '@ember/test-helpers';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | TargetProfiles::CreateTargetProfileForm', (hooks) => {
  setupRenderingTest(hooks);

  let targetProfile;
  let isFileInvalid;

  let onLoadFile;
  let onSubmit;
  let onCancel;

  hooks.beforeEach(function() {
    targetProfile = {
      name: '',
      imageUrl: '',
      ownerOrganizationId: '',
      isPublic: false,
    };

    isFileInvalid = false;

    onLoadFile = sinon.stub();
    onSubmit = sinon.stub();
    const onSubmitWrapper = function(e) {
      e.preventDefault();
      onSubmit();
    };
    onCancel = sinon.stub();

    this.set('targetProfile', targetProfile);
    this.set('isFileInvalid', isFileInvalid);

    this.set('onLoadFile', onLoadFile);
    this.set('onSubmit', onSubmitWrapper);
    this.set('onCancel', onCancel);

  });

  test('it should display the items', async function(assert) {
    // when
    await render(hbs`<TargetProfiles::CreateTargetProfileForm
      @targetProfile={{this.targetProfile}}
      @isFileInvalid={{this.isFileInvalid}}

      @onLoadFile={{this.onLoadFile}}
      @onSubmit={{this.onSubmit}}
      @onCancel={{this.onCancel}}/>`);

    // then
    assert.contains('Nom * :');
    assert.contains('Public :');
    assert.contains('Fichier JSON Pix Editor * :');
    assert.contains('Identifiant de l\'organisation de référence :');
    assert.contains('Lien de l\'image du profil cible :');
    assert.contains('Annuler');
    assert.contains('Enregistrer');
  });

  test('it should display json file error text', async function(assert) {
    // given
    this.set('isFileInvalid', true);

    // when
    await render(hbs`<TargetProfiles::CreateTargetProfileForm
      @targetProfile={{this.targetProfile}}
      @isFileInvalid={{this.isFileInvalid}}

      @onLoadFile={{this.onLoadFile}}
      @onSubmit={{this.onSubmit}}
      @onCancel={{this.onCancel}}/>`);

    // then
    assert.contains('Le fichier Pix Editor n\'est pas au bon format.');
  });

  test('it should call onSubmit when form is valid', async function(assert) {
    // when
    await render(hbs`<TargetProfiles::CreateTargetProfileForm
      @targetProfile={{this.targetProfile}}
      @isFileInvalid={{this.isFileInvalid}}

      @onLoadFile={{this.onLoadFile}}
      @onSubmit={{this.onSubmit}}
      @onCancel={{this.onCancel}}/>`);

    await triggerEvent('form', 'submit');

    // then
    assert.ok(onSubmit.called);
  });

  test('it should call onCancel when form is cancel', async function(assert) {
    // when
    await render(hbs`<TargetProfiles::CreateTargetProfileForm
      @targetProfile={{this.targetProfile}}
      @isFileInvalid={{this.isFileInvalid}}

      @onLoadFile={{this.onLoadFile}}
      @onSubmit={{this.onSubmit}}
      @onCancel={{this.onCancel}}/>`);

    await click('button[type="button"]');

    // then
    assert.ok(onCancel.called);
  });

  test('it should call onLoadFile when file is selected', async function(assert) {
    // when
    await render(hbs`<TargetProfiles::CreateTargetProfileForm
      @targetProfile={{this.targetProfile}}
      @isFileInvalid={{this.isFileInvalid}}

      @onLoadFile={{this.onLoadFile}}
      @onSubmit={{this.onSubmit}}
      @onCancel={{this.onCancel}}/>`);

    await triggerEvent('#skillsList', 'change');

    // then
    assert.ok(onLoadFile.called);
  });
});
