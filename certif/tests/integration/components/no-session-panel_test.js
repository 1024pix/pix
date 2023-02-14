import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | no-session-panel', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders a button link to the new session creation page', async function (assert) {
    // given
    class FeatureTogglesStub extends Service {
      featureToggles = { isMassiveSessionManagementEnabled: false };
    }
    this.owner.register('service:featureToggles', FeatureTogglesStub);

    // when
    const { getByRole } = await render(hbs`<NoSessionPanel />`);

    // then
    assert.dom(getByRole('link', { name: 'Créer une session' })).exists();
  });

  module('isMassiveSessionManagementEnabled feature toggle', function () {
    module('isMassiveSessionManagementEnabled feature toggle is true', function () {
      test('it renders a button link to the session import page', async function (assert) {
        // given
        class FeatureTogglesStub extends Service {
          featureToggles = { isMassiveSessionManagementEnabled: true };
        }
        this.owner.register('service:featureToggles', FeatureTogglesStub);

        // when
        const { getByRole } = await render(hbs`<NoSessionPanel />`);

        // then
        assert.dom(getByRole('link', { name: 'Créer plusieurs sessions' })).exists();
      });
    });

    module('isMassiveSessionManagementEnabled feature toggle is false', function () {
      test('it does not render a link to the session import page', async function (assert) {
        // given
        class FeatureTogglesStub extends Service {
          featureToggles = { isMassiveSessionManagementEnabled: false };
        }
        this.owner.register('service:featureToggles', FeatureTogglesStub);

        // when
        const { queryByRole } = await render(hbs`<NoSessionPanel />`);

        // then
        assert.dom(queryByRole('link', { name: 'Créer plusieurs sessions' })).doesNotExist();
      });
    });
  });
});
