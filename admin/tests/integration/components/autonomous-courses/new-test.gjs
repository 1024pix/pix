import { clickByName, render } from '@1024pix/ember-testing-library';
import { triggerEvent } from '@ember/test-helpers';
import NewAutonomousCourse from 'pix-admin/components/autonomous-courses/new';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | AutonomousCourses | NewAutonomousCourse', function (hooks) {
  setupIntlRenderingTest(hooks);

  const autonomousCourse = {};
  const targetProfiles = [];
  const onSubmit = sinon.stub();
  const onCancel = sinon.stub();

  hooks.beforeEach(async function () {
    const serviceRouter = this.owner.lookup('service:router');
    sinon.stub(serviceRouter, 'currentRouteName').value('authenticated.autonomous-courses.details');
    sinon
      .stub(serviceRouter, 'currentRoute')
      .value({ localName: 'details', parent: { name: 'authenticated.autonomous-courses' } });
  });

  test('it renders the autonomous-courses creation form component', async function (assert) {
    // when
    const screen = await render(
      <template>
        <NewAutonomousCourse
          @autonomousCourse={{autonomousCourse}}
          @targetProfiles={{targetProfiles}}
          @onSubmit={{onSubmit}}
          @onCancel={{onCancel}}
        />
      </template>,
    );

    // then
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
      <template>
        <NewAutonomousCourse
          @autonomousCourse={{autonomousCourse}}
          @targetProfiles={{targetProfiles}}
          @onSubmit={{onSubmit}}
          @onCancel={{onCancel}}
        />
      </template>,
    );

    await triggerEvent('form', 'submit');

    // then
    assert.ok(onSubmit.called);
  });

  test('it should call onCancel when form is cancel', async function (assert) {
    // when
    await render(
      <template>
        <NewAutonomousCourse
          @autonomousCourse={{autonomousCourse}}
          @targetProfiles={{targetProfiles}}
          @onSubmit={{onSubmit}}
          @onCancel={{onCancel}}
        />
      </template>,
    );

    await clickByName('Annuler');

    // then
    assert.ok(onCancel.called);
  });
});
