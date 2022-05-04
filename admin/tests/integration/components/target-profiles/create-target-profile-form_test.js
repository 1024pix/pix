import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { triggerEvent } from '@ember/test-helpers';
import { render, clickByName } from '@1024pix/ember-testing-library';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | TargetProfiles::CreateTargetProfileForm', function (hooks) {
  setupRenderingTest(hooks);

  let targetProfile;
  let isFileInvalid;

  let onLoadFile;
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

    isFileInvalid = false;

    onLoadFile = sinon.stub();
    onSubmit = sinon.stub();
    const onSubmitWrapper = function (e) {
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

  test('it should display the items', async function (assert) {
    // when
    const screen = await render(hbs`<TargetProfiles::CreateTargetProfileForm
      @targetProfile={{this.targetProfile}}
      @isFileInvalid={{this.isFileInvalid}}

      @onLoadFile={{this.onLoadFile}}
      @onSubmit={{this.onSubmit}}
      @onCancel={{this.onCancel}}/>`);

    // then
    assert.dom(screen.getByLabelText('Nom (obligatoire) :')).exists();
    assert.dom(screen.getByLabelText('Public :')).exists();
    assert.dom(screen.getByLabelText('Importer un profil cible .JSON')).exists();
    assert.dom(screen.getByLabelText("Identifiant de l'organisation de référence :")).exists();
    assert.dom(screen.getByLabelText("Lien de l'image du profil cible :", { exact: false })).exists();
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Créer le profil cible' })).exists();
    assert.dom(screen.getByLabelText('Commentaire (usage interne) :')).exists();
  });

  test('it should display json file error text', async function (assert) {
    // given
    this.set('isFileInvalid', true);

    // when
    const screen = await render(hbs`<TargetProfiles::CreateTargetProfileForm
      @targetProfile={{this.targetProfile}}
      @isFileInvalid={{this.isFileInvalid}}

      @onLoadFile={{this.onLoadFile}}
      @onSubmit={{this.onSubmit}}
      @onCancel={{this.onCancel}}/>`);

    // then
    assert.dom(screen.getByText("Le fichier Pix Editor n'est pas au bon format.")).exists();
  });

  test('it should call onSubmit when form is valid', async function (assert) {
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

  test('it should call onCancel when form is cancel', async function (assert) {
    // when
    await render(hbs`<TargetProfiles::CreateTargetProfileForm
      @targetProfile={{this.targetProfile}}
      @isFileInvalid={{this.isFileInvalid}}

      @onLoadFile={{this.onLoadFile}}
      @onSubmit={{this.onSubmit}}
      @onCancel={{this.onCancel}}/>`);

    await clickByName('Annuler');

    // then
    assert.ok(onCancel.called);
  });

  test('it should call onLoadFile when file is selected', async function (assert) {
    // when
    await render(hbs`<TargetProfiles::CreateTargetProfileForm
      @targetProfile={{this.targetProfile}}
      @isFileInvalid={{this.isFileInvalid}}

      @onLoadFile={{this.onLoadFile}}
      @onSubmit={{this.onSubmit}}
      @onCancel={{this.onCancel}}/>`);

    await triggerEvent('#skillsList', 'change', { files: [new Blob(['file'])] });

    // then
    assert.ok(onLoadFile.called);
  });
});
