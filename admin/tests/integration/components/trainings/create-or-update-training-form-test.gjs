import { clickByName, render } from '@1024pix/ember-testing-library';
import { triggerEvent } from '@ember/test-helpers';
import CreateOrUpdateTrainingForm from 'pix-admin/components/trainings/create-or-update-training-form';
import { localeCategories, typeCategories } from 'pix-admin/models/training';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | trainings | CreateOrUpdateTrainingForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  const onSubmit = sinon.stub();
  const onCancel = sinon.stub();

  test('it should display the items', async function (assert) {
    // when
    const screen = await render(
      <template><CreateOrUpdateTrainingForm @onSubmit={{onSubmit}} @onCancel={{onCancel}} /></template>,
    );

    // then
    assert.dom(screen.getByLabelText('Titre')).exists();
    assert.dom(screen.getByLabelText('Lien')).exists();
    assert.dom(screen.getByLabelText('Format')).exists();
    assert.dom(screen.getByLabelText('Jours (JJ)')).exists();
    assert.dom(screen.getByLabelText('Heures (HH)')).exists();
    assert.dom(screen.getByLabelText('Minutes (MM)')).exists();
    assert.dom(screen.getByLabelText('Langue localisée')).exists();
    assert.dom(screen.getByLabelText('Nom du fichier du logo éditeur', { exact: false })).exists();
    assert.dom(screen.queryByLabelText('Mettre en pause')).doesNotExist();
    assert
      .dom(
        screen.getByLabelText(
          "Nom de l'éditeur Exemple: Ministère de l'Éducation nationale et de la Jeunesse. Liberté égalité fraternité",
        ),
      )
      .exists();
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Créer le contenu formatif' })).exists();
  });

  test('it should call onSubmit when form is valid', async function (assert) {
    // when
    await render(<template><CreateOrUpdateTrainingForm @onSubmit={{onSubmit}} @onCancel={{onCancel}} /></template>);

    await triggerEvent('form', 'submit');

    // then
    assert.ok(onSubmit.called);
  });

  test('it should call onCancel when form is cancel', async function (assert) {
    // when
    await render(<template><CreateOrUpdateTrainingForm @onSubmit={{onSubmit}} @onCancel={{onCancel}} /></template>);

    await clickByName('Annuler');

    // then
    assert.ok(onCancel.called);
  });

  module('when model is provided', function () {
    test('it should display the items with model values', async function (assert) {
      // given
      const editorLogo = 'un-logo.svg';
      const model = {
        title: 'Un contenu formatif',
        link: 'https://un-contenu-formatif',
        type: 'webinaire',
        locale: 'fr-fr',
        editorName: 'Un éditeur de contenu formatif',
        editorLogoUrl: `https://example.net/${editorLogo}`,
        duration: { days: 0, hours: 0, minutes: 0 },
        isDisabled: false,
      };

      // when
      const screen = await render(
        <template>
          <CreateOrUpdateTrainingForm @onSubmit={{onSubmit}} @onCancel={{onCancel}} @model={{model}} />
        </template>,
      );

      // then
      assert.dom(screen.getByLabelText('Titre')).hasValue(model.title);
      assert.dom(screen.getByLabelText('Lien')).hasValue(model.link);
      assert.strictEqual(screen.getByLabelText('Format').innerText, typeCategories[model.type]);
      assert.dom(screen.getByLabelText('Jours (JJ)')).hasValue(model.duration.days.toString());
      assert.dom(screen.getByLabelText('Heures (HH)')).hasValue(model.duration.hours.toString());
      assert.dom(screen.getByLabelText('Minutes (MM)')).hasValue(model.duration.minutes.toString());
      assert.strictEqual(screen.getByLabelText('Langue localisée').innerText, localeCategories[model.locale]);
      assert.dom(screen.getByLabelText('Nom du fichier du logo éditeur', { exact: false })).hasValue(editorLogo);
      assert.strictEqual(screen.getByLabelText('Mettre en pause').checked, model.isDisabled);
      assert
        .dom(
          screen.getByLabelText(
            "Nom de l'éditeur Exemple: Ministère de l'Éducation nationale et de la Jeunesse. Liberté égalité fraternité",
          ),
        )
        .exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Modifier le contenu formatif' })).exists();
    });
  });
});
