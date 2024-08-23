import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import TrainingDetailsCard from 'pix-admin/components/trainings/training-details-card';
import { module, test } from 'qunit';

module('Integration | Component | Trainings::TrainingDetailsCard', function (hooks) {
  setupRenderingTest(hooks);

  const training = {
    title: 'Un contenu formatif',
    link: 'https://un-contenu-formatif',
    type: 'webinaire',
    locale: 'fr-fr',
    editorName: 'Un éditeur de contenu formatif',
    editorLogoUrl: 'un-logo.svg',
    duration: {
      days: 2,
    },
    isRecommendable: true,
  };

  test('it should display the details', async function (assert) {
    // when
    const screen = await render(<template><TrainingDetailsCard @training={{training}} /></template>);

    // then
    assert.dom(screen.getByText('Un contenu formatif')).exists();
    assert.dom(screen.getByText('https://un-contenu-formatif')).exists();
    assert.dom(screen.getByText('webinaire')).exists();
    assert.dom(screen.getByText('2j')).exists();
    assert.dom(screen.getByText('Franco-français (fr-fr)')).exists();
    assert.dom(screen.getByText('Un éditeur de contenu formatif')).exists();
    assert.dom(screen.getByText('un-logo.svg')).exists();
    assert.dom(screen.getByAltText('Un éditeur de contenu formatif')).exists();
  });

  test('it should display "Déclenchable" when training is recommendable', async function (assert) {
    // given
    training.isRecommendable = true;
    const screen = await render(<template><TrainingDetailsCard @training={{training}} /></template>);

    // then
    assert.dom(screen.getByText('Déclenchable')).exists();
  });

  test('it should display "Non déclenchable" when training is not recommendable', async function (assert) {
    // given
    training.isRecommendable = false;
    const screen = await render(<template><TrainingDetailsCard @training={{training}} /></template>);

    // then
    assert.dom(screen.getByText('Non déclenchable')).exists();
  });

  test('it should display "Actif" when training is not disabled', async function (assert) {
    // given
    training.isDisabled = false;
    const screen = await render(<template><TrainingDetailsCard @training={{training}} /></template>);

    // then
    assert.dom(screen.getByText('Actif')).exists();
  });

  test('it should display "En pause" when training is disabled', async function (assert) {
    // given
    training.isDisabled = true;
    const screen = await render(<template><TrainingDetailsCard @training={{training}} /></template>);

    // then
    assert.dom(screen.getByText('En pause')).exists();
  });
});
