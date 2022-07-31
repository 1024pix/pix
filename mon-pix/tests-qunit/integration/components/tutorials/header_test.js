import { module, test } from 'qunit';
import { find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import Service from '@ember/service';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | Tutorials | Header', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    class RouterStub extends Service {
      currentRouteName = 'user-tutorials.recommended';
    }
    this.owner.register('service:router', RouterStub);
  });

  test('renders the header', async function (assert) {
    // when
    await render(hbs`<Tutorials::Header />`);

    // then
    assert.dom(find('.user-tutorials-banner-v2__title')).exists();
    assert.dom(find('.user-tutorials-banner-v2__description')).exists();
    assert.dom(find('.user-tutorials-banner-v2__filters')).exists();
    assert.equal(findAll('a.pix-choice-chip').length, 2);
    assert.dom(find('a.pix-choice-chip,a.pix-choice-chip--active')).exists();
    assert.dom(find('a.pix-choice-chip,a.pix-choice-chip--active')).hasProperty('textContent').hasValue('Recommandés');
  });

  test('should render filter button when tutorial filter feature toggle is activate', async function (assert) {
    // given
    class FeatureTogglesStub extends Service {
      featureToggles = { isPixAppTutoFiltersEnabled: true };
    }
    this.owner.register('service:featureToggles', FeatureTogglesStub);

    // when
    const screen = await render(hbs`<Tutorials::Header />`);

    // then
    assert.dom(screen.getByRole('button', { name: 'Filtrer' })).exists();
  });
});
