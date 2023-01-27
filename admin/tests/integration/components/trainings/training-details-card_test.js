import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Trainings::TrainingDetailsCard', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('training', {
      title: 'Un contenu formatif',
      link: 'https://un-contenu-formatif',
      type: 'Webinaire',
      locale: 'fr-fr',
      editorName: 'Un éditeur de contenu formatif',
      editorLogoUrl: 'un-logo.svg',
      duration: {
        days: 2,
      },
    });
  });

  test('it should display the details', async function (assert) {
    // when
    const screen = await render(hbs`<Trainings::TrainingDetailsCard @training={{this.training}} />`);

    // then
    assert.dom(screen.getByText('Un contenu formatif')).exists();
    assert.dom(screen.getByText('https://un-contenu-formatif')).exists();
    assert.dom(screen.getByText('Webinaire')).exists();
    assert.dom(screen.getByText('2j')).exists();
    assert.dom(screen.getByText('Franco-français (fr-fr)')).exists();
    assert.dom(screen.getByText('Un éditeur de contenu formatif')).exists();
    assert.dom(screen.getByText('un-logo.svg')).exists();
    assert.dom(screen.getByAltText('Un éditeur de contenu formatif')).exists();
  });
});
