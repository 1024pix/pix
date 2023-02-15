import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { triggerEvent } from '@ember/test-helpers';
import { render, clickByName } from '@1024pix/ember-testing-library';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Trainings::CreateOrUpdateTrainingForm', function (hooks) {
  setupRenderingTest(hooks);

  let form;
  let onSubmit;
  let onCancel;

  hooks.beforeEach(function () {
    form = {
      title: 'Un contenu formatif',
      link: 'https://un-contenu-formatif',
      type: 'Webinaire',
      locale: 'fr-fr',
      editorName: 'Un éditeur de contenu formatif',
      editorLogoUrl: 'un-logo.svg',
      duration: '2d2h50m',
    };
    onSubmit = sinon.stub();

    onCancel = sinon.stub();

    this.set('onSubmit', onSubmit);
    this.set('onCancel', onCancel);
    this.set('form', form);
  });

  test('it should display the items', async function (assert) {
    // when
    const screen = await render(hbs`<Trainings::CreateOrUpdateTrainingForm
  @onSubmit={{this.onSubmit}}
  @onCancel={{this.onCancel}}
/>`);

    // then
    assert.dom(screen.getByLabelText('Titre')).exists();
    assert.dom(screen.getByLabelText('Lien')).exists();
    assert.dom(screen.getByLabelText('Format')).exists();
    assert.dom(screen.getByLabelText('Jours (JJ)')).exists();
    assert.dom(screen.getByLabelText('Heures (HH)')).exists();
    assert.dom(screen.getByLabelText('Minutes (MM)')).exists();
    assert.dom(screen.getByLabelText('Langue localisée')).exists();
    assert.dom(screen.getByLabelText('Nom du fichier du logo éditeur')).exists();
    assert
      .dom(screen.getByLabelText("Nom de l'éditeur Exemple: Ministère de l'Éducation nationale et de la Jeunesse"))
      .exists();
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Créer le contenu formatif' })).exists();
  });

  test('it should call onSubmit when form is valid', async function (assert) {
    // when
    await render(hbs`<Trainings::CreateOrUpdateTrainingForm
  @onSubmit={{this.onSubmit}}
  @onCancel={{this.onCancel}}
/>`);

    await triggerEvent('form', 'submit');

    // then
    assert.ok(onSubmit.called);
  });

  test('it should call onCancel when form is cancel', async function (assert) {
    // when
    await render(hbs`<Trainings::CreateOrUpdateTrainingForm
  @onSubmit={{this.onSubmit}}
  @onCancel={{this.onCancel}}
/>`);

    await clickByName('Annuler');

    // then
    assert.ok(onCancel.called);
  });
});
