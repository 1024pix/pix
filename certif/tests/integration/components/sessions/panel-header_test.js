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
    module('isMassiveSessionManagementEnabled feature toggle is true', function () {
      test('it renders a download button for the mass import template', async function (assert) {
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

      test('it renders an import button for the session mass import', async function (assert) {
        // given
        class FeatureTogglesStub extends Service {
          featureToggles = { isMassiveSessionManagementEnabled: true };
        }
        this.owner.register('service:featureToggles', FeatureTogglesStub);

        // when
        const screen = await render(hbs`<Sessions::PanelHeader />`);

        // then
        assert.dom(screen.getByRole('button', { name: 'Importer en masse' })).exists();
      });
    });

    module('isMassiveSessionManagementEnabled feature toggle is false', function () {
      test('it does not render a download button for the mass import template', async function (assert) {
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

      test('it does not render an import button for the session mass import', async function (assert) {
        // given
        class FeatureTogglesStub extends Service {
          featureToggles = { isMassiveSessionManagementEnabled: false };
        }
        this.owner.register('service:featureToggles', FeatureTogglesStub);

        // when
        const { queryByLabelText } = await render(hbs`<Sessions::PanelHeader />`);

        // then
        assert.dom(queryByLabelText('Importer en masse')).doesNotExist();
      });
    });
  });
});
