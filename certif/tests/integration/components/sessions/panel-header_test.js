import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | panel-header', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders a link to the new session creation page', async function (assert) {
    // given
    class FeatureTogglesStub extends Service {
      featureToggles = { isMassiveSessionManagementEnabled: false };
    }
    this.owner.register('service:featureToggles', FeatureTogglesStub);

    // when
    const { getByRole } = await render(hbs`<Sessions::PanelHeader />`);

    // then
    assert.dom(getByRole('link', { name: 'Créer une session' })).exists();
  });

  module('isMassiveSessionManagementEnabled feature toggle', function () {
    test('it does not render a download button for the mass import template when toggle is set to false', async function (assert) {
      // given
      class FeatureTogglesStub extends Service {
        featureToggles = { isMassiveSessionManagementEnabled: false };
      }
      this.owner.register('service:featureToggles', FeatureTogglesStub);

      // when
      const { queryByLabelText } = await render(hbs`<Sessions::PanelHeader />`);

      // then
      assert.dom(queryByLabelText("Télécharger le template d'import en masse")).doesNotExist();
    });

    test('it renders a download button for the mass import template when toggle is set to true', async function (assert) {
      // given
      class FeatureTogglesStub extends Service {
        featureToggles = { isMassiveSessionManagementEnabled: true };
      }
      this.owner.register('service:featureToggles', FeatureTogglesStub);

      // when
      const { getByLabelText } = await render(hbs`<Sessions::PanelHeader />`);

      // then
      assert.dom(getByLabelText("Télécharger le template d'import en masse")).exists();
    });
  });
});
