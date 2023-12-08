import sinon from 'sinon';
import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { triggerEvent } from '@ember/test-helpers';
import { clickByName, render } from '@1024pix/ember-testing-library';

module('Integration | Component | AutonomousCourses::CreateAutonomousCourseForm', function (hooks) {
  setupRenderingTest(hooks);

  let autonomousCourse, targetProfiles, onSubmit, onCancel;

  hooks.beforeEach(function () {
    autonomousCourse = {};
    targetProfiles = [];

    onSubmit = sinon.stub();
    onCancel = sinon.stub();

    this.set('autonomousCourse', autonomousCourse);
    this.set('targetProfiles', targetProfiles);
    this.set('onSubmit', onSubmit);
    this.set('onCancel', onCancel);
  });

  test('it renders the autonomous-courses creation form component', async function (assert) {
    // when
    const screen = await render(
      hbs`<AutonomousCourses::CreateAutonomousCourseForm
        @autonomousCourse={{this.autonomousCourse}}
        @targetProfiles={{this.targetProfiles}}
        @onSubmit={{this.onSubmit}}
        @onCancel={{this.onCancel}}
      />`,
    );

    // then
    assert.dom(screen.getByText(/Les champs marqués de * sont obligatoires./)).exists();
    assert.dom(screen.getByText(/Informations techniques/)).exists();
    assert.dom(screen.getByText(/Nom interne/)).exists();
    assert.dom(screen.getByText(/Quel profil cible voulez-vous associer à ce parcours autonome ?/)).exists();
    assert
      .dom(
        screen.getByText(
          /Le profil cible doit être en accès simplifié et relié à l’organisation "Organisation pour les parcours autonomes"/,
        ),
      )
      .exists();

    assert.dom(screen.getByText(/Nom public/)).exists();
    assert
      .dom(screen.getByText(/Le nom du parcours autonome sera affiché sur la page de démarrage du candidat./))
      .exists();
    assert.dom(screen.getByText(/Texte de la page d'accueil :/)).exists();
    assert.dom(screen.getByRole('button', { name: 'Créer le parcours autonome' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
  });

  test('it should call onSubmit when form is valid', async function (assert) {
    // when
    await render(
      hbs`<AutonomousCourses::CreateAutonomousCourseForm
        @autonomousCourse={{this.autonomousCourse}}
        @targetProfiles={{this.targetProfiles}}
        @onSubmit={{this.onSubmit}}
        @onCancel={{this.onCancel}}
      />`,
    );

    await triggerEvent('form', 'submit');

    // then
    assert.ok(onSubmit.called);
  });

  test('it should call onCancel when form is cancel', async function (assert) {
    // when
    await render(
      hbs`<AutonomousCourses::CreateAutonomousCourseForm
        @autonomousCourse={{this.autonomousCourse}}
        @targetProfiles={{this.targetProfiles}}
        @onSubmit={{this.onSubmit}}
        @onCancel={{this.onCancel}}
      />`,
    );

    await clickByName('Annuler');

    // then
    assert.ok(onCancel.called);
  });
});
