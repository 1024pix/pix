import { module, test } from 'qunit';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Tutorials | Card', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders component', async function (assert) {
    // given
    this.set('tutorial', {
      title: 'Mon super tutoriel',
      link: 'https://exemple.net/',
      source: 'mon-tuto',
      format: 'vidéo',
      duration: '00:01:00',
      isEvaluated: true,
      isSaved: true,
    });

    // when
    await render(hbs`<Tutorials::Card @tutorial={{this.tutorial}} />`);

    // then
    assert.dom(find('.tutorial-card-v2')).exists();
    assert.dom(find('.tutorial-card-v2__content')).exists();
    assert.dom(find('.tutorial-card-v2-content__link')).hasProperty('textContent').hasValue('Mon super tutoriel');
    assert.dom(find('.tutorial-card-v2-content__link')).hasProperty('href').hasValue('https://exemple.net/');
    assert.dom(find('.tutorial-card-v2-content__details')).hasProperty('textContent').hasText('mon-tuto • vidéo • une minute');
    assert.dom(find('.tutorial-card-v2-content__actions')).exists();
    assert.dom(find('[aria-label="Ne plus considérer ce tuto comme utile"]')).exists();
    assert.dom(find('[aria-label="Retirer de ma liste de tutos"]')).exists();
    assert.dom(find('[title="Ne plus considérer ce tuto comme utile"]')).exists();
  });
});
