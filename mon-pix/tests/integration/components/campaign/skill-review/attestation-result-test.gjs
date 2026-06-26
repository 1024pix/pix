import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import AttestationResult from 'mon-pix/components/campaigns/assessment/results/evaluation-results-hero/attestation-result';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubSessionService } from '../../../../helpers/service-stubs.js';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign | Skill Review | attestation-result', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the attestation is obtained', function () {
    test('it should display the expected message and title', async function (assert) {
      const result = [
        {
          reward: { key: 'SIXTH_GRADE', label: '6ème' },
          obtained: true,
        },
      ];

      const screen = await render(<template><AttestationResult @results={{result}} /></template>);
      const obtainedTitle = t('components.campaigns.attestation-result.obtained');
      assert.dom(screen.getByText(obtainedTitle)).exists();

      assert.dom(screen.getByText(result[0].reward.label)).exists();
    });

    test('it should display the download button', async function (assert) {
      const result = [
        {
          reward: { key: 'SIXTH_GRADE', label: '6ème' },
          obtained: true,
        },
      ];

      const screen = await render(<template><AttestationResult @results={{result}} /></template>);
      const downloadButtonTitle = t('common.actions.download');
      assert.dom(screen.getByRole('button', { name: downloadButtonTitle })).exists();
    });

    test('it should download the attestation on download button click and send metrics', async function (assert) {
      // given
      const result = [
        {
          reward: { key: 'SIXTH_GRADE', label: 'Sensibilisation au numérique' },
          obtained: true,
        },
      ];
      stubSessionService(this.owner, { isAuthenticated: true });

      const fileSaverSaveStub = sinon.stub();
      class FileSaverStub extends Service {
        save = fileSaverSaveStub;
      }

      this.owner.register('service:fileSaver', FileSaverStub);

      class MetricsStub extends Service {
        trackEvent = metricsAddStub;
      }
      const metricsAddStub = sinon.stub().resolves();

      this.owner.register('service:pix-metrics', MetricsStub);

      // when
      const screen = await render(<template><AttestationResult @results={{result}} /></template>);
      await click(screen.getByRole('button', { name: t('common.actions.download') }));
      // then
      assert.ok(
        fileSaverSaveStub.calledWithExactly({
          url: '/api/users/123/attestations/SIXTH_GRADE',
          fileName: 'attestation-sensibilisation-au-numerique',
          token: 'access_token!',
        }),
      );

      assert.ok(
        metricsAddStub.calledWithExactly('Clic sur le bouton Télécharger (attestation)', {
          category: 'Fin de parcours',
          disabled: true,
          action: 'Cliquer sur le bouton Télécharger (attestation)',
        }),
      );
    });

    test('it should call onError method if the attestation can not be downloaded', async function (assert) {
      // given
      const result = [
        {
          reward: { key: 'SIXTH_GRADE', label: 'Sensibilisation au numérique' },
          obtained: true,
        },
      ];
      stubSessionService(this.owner, { isAuthenticated: true });

      const onErrorStub = sinon.stub();
      const fileSaverSaveStub = sinon.stub().throws();
      class FileSaverStub extends Service {
        save = fileSaverSaveStub;
      }

      this.owner.register('service:fileSaver', FileSaverStub);

      // when
      const screen = await render(
        <template><AttestationResult @results={{result}} @onError={{onErrorStub}} /></template>,
      );
      await click(screen.getByRole('button', { name: t('common.actions.download') }));

      // then
      assert.ok(
        fileSaverSaveStub.calledWithExactly({
          url: '/api/users/123/attestations/SIXTH_GRADE',
          fileName: 'attestation-sensibilisation-au-numerique',
          token: 'access_token!',
        }),
      );
      assert.ok(onErrorStub.calledOnce);
    });
  });

  module('when the attestation is not obtained', function () {
    test('it should display the expected message', async function (assert) {
      const result = [
        {
          reward: { key: 'SIXTH_GRADE', label: '6ème' },
          obtained: false,
        },
      ];

      const screen = await render(<template><AttestationResult @results={{result}} /></template>);
      const notObtainedTitle = t('components.campaigns.attestation-result.not-obtained');
      assert.dom(screen.getByText(notObtainedTitle)).exists();
    });

    test('it should display the attestation title', async function (assert) {
      const result = [
        {
          reward: { key: 'SIXTH_GRADE', label: '6ème' },
          obtained: false,
        },
      ];

      const screen = await render(<template><AttestationResult @results={{result}} /></template>);
      assert.dom(screen.getByText(result[0].reward.label)).exists();
    });

    test('it should not display the download button', async function (assert) {
      const result = [
        {
          reward: { key: 'SIXTH_GRADE', label: '6ème' },
          obtained: false,
        },
      ];

      const screen = await render(<template><AttestationResult @results={{result}} /></template>);
      const downloadButton = t('common.actions.download');
      assert.dom(screen.queryByRole('button', { name: downloadButton })).doesNotExist();
    });
  });

  module('when the attestation is still computing', function () {
    test('it should display the expected message', async function (assert) {
      const result = [{ obtained: null, label: '6ème' }];

      const screen = await render(<template><AttestationResult @results={{result}} /></template>);
      const computingTitle = t('components.campaigns.attestation-result.computing');
      assert.dom(screen.getByText(computingTitle)).exists();
    });
  });
});
