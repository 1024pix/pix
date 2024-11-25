import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import AttestationResult from 'mon-pix/components/campaigns/assessment/results/evaluation-results-hero/attestation-result';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign | Skill Review | attestation-result', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the attestation is obtained', function () {
    test('it should display the expected message', async function (assert) {
      const result = [
        {
          reward: { key: 'SIXTH_GRADE' },
          obtained: true,
        },
      ];

      const screen = await render(<template><AttestationResult @results={{result}} /></template>);
      const obtainedTitle = t('components.campaigns.attestation-result.obtained');
      assert.dom(screen.getByText(obtainedTitle)).exists();
    });

    test('it should display the attestation title', async function (assert) {
      const result = [
        {
          reward: { key: 'SIXTH_GRADE' },
          obtained: true,
        },
      ];

      const screen = await render(<template><AttestationResult @results={{result}} /></template>);
      const rewardTitle = t(`components.campaigns.attestation-result.${result[0].reward.key}.title`);
      assert.dom(screen.getByText(rewardTitle)).exists();
    });

    test('it should display the download button', async function (assert) {
      const result = [
        {
          reward: { key: 'SIXTH_GRADE' },
          obtained: true,
        },
      ];

      const screen = await render(<template><AttestationResult @results={{result}} /></template>);
      const downloadButtonTitle = t('common.actions.download');
      assert.dom(screen.getByRole('button', { name: downloadButtonTitle })).exists();
    });

    test('it should download the attestation on download button click', async function (assert) {
      // given
      const result = [
        {
          reward: { key: 'SIXTH_GRADE' },
          obtained: true,
        },
      ];
      class sessionService extends Service {
        isAuthenticated = true;
        data = {
          authenticated: {
            access_token: 'access_token',
            user_id: 1,
            source: 'pix',
          },
        };
      }
      const fileSaverSaveStub = sinon.stub();
      class FileSaverStub extends Service {
        save = fileSaverSaveStub;
      }

      this.owner.register('service:session', sessionService);
      this.owner.register('service:fileSaver', FileSaverStub);

      // when
      const screen = await render(<template><AttestationResult @results={{result}} /></template>);
      await click(screen.getByRole('button', { name: t('common.actions.download') }));

      // then
      assert.ok(
        fileSaverSaveStub.calledWithExactly({
          url: '/api/users/1/attestations/SIXTH_GRADE',
          fileName: 'sensibilisation-au-numerique',
          token: 'access_token',
        }),
      );
    });

    test('it should call onError method if the attestation can not be downloaded', async function (assert) {
      // given
      const result = [
        {
          reward: { key: 'SIXTH_GRADE' },
          obtained: true,
        },
      ];
      class sessionService extends Service {
        isAuthenticated = true;
        data = {
          authenticated: {
            access_token: 'access_token',
            user_id: 1,
            source: 'pix',
          },
        };
      }
      const onErrorStub = sinon.stub();
      const fileSaverSaveStub = sinon.stub().throws();
      class FileSaverStub extends Service {
        save = fileSaverSaveStub;
      }

      this.owner.register('service:session', sessionService);
      this.owner.register('service:fileSaver', FileSaverStub);

      // when
      const screen = await render(
        <template><AttestationResult @results={{result}} @onError={{onErrorStub}} /></template>,
      );
      await click(screen.getByRole('button', { name: t('common.actions.download') }));

      // then
      assert.ok(
        fileSaverSaveStub.calledWithExactly({
          url: '/api/users/1/attestations/SIXTH_GRADE',
          fileName: 'sensibilisation-au-numerique',
          token: 'access_token',
        }),
      );
      assert.ok(onErrorStub.calledOnce);
    });
  });

  module('when the attestation is not obtained', function () {
    test('it should display the expected message', async function (assert) {
      const result = [
        {
          reward: { key: 'SIXTH_GRADE' },
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
          reward: { key: 'SIXTH_GRADE' },
          obtained: false,
        },
      ];

      const screen = await render(<template><AttestationResult @results={{result}} /></template>);
      const rewardTitle = t(`components.campaigns.attestation-result.SIXTH_GRADE.title`);
      assert.dom(screen.getByText(rewardTitle)).exists();
    });

    test('it should not display the download button', async function (assert) {
      const result = [
        {
          reward: { key: 'SIXTH_GRADE' },
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
      const result = [{ obtained: null }];

      const screen = await render(<template><AttestationResult @results={{result}} /></template>);
      const computingTitle = t('components.campaigns.attestation-result.computing');
      assert.dom(screen.getByText(computingTitle)).exists();
    });
  });
});
