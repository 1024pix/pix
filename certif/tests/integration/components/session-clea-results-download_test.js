import { render as renderScreen } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import Service from '@ember/service';
import sinon from 'sinon';
import { module, test } from 'qunit';

module('Integration | Component | session-clea-results-download', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there is an error during the download of the candidates data', function () {
    test('should show the error message', async function (assert) {
      // given
      class FeatureTogglesStub extends Service {
        featureToggles = { isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled: false };
      }
      this.owner.register('service:featureToggles', FeatureTogglesStub);
      const fileSaverSaveStub = sinon.stub();
      class FileSaverStub extends Service {
        save = fileSaverSaveStub;
      }
      this.owner.register('service:fileSaver', FileSaverStub);

      fileSaverSaveStub.rejects(new Error('an error message'));

      const store = this.owner.lookup('service:store');
      const session = store.createRecord('session', {
        hasSomeCleaAcquired: true,
        publishedAt: '2022-01-01',
      });
      this.set('session', session);

      const screen = await renderScreen(hbs`{{session-clea-results-download session=session}}`);

      // when
      await click(
        screen.getByRole('button', { name: this.intl.t('pages.sessions.detail.panel-clea.download-button') })
      );

      // then
      assert.dom(screen.getByText('an error message')).exists();
    });
  });
});
