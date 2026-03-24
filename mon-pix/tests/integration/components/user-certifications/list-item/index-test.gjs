import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ListItem from 'mon-pix/components/user-certifications/list-item';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | User certifications | List item', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when status is WAITING_FOR_RESULTS', function () {
    test('displays card with a specific tag, details, no action and empty score hexagon', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificateSummary = store.createRecord('certificate-summary', {
        certificationStartedAt: new Date('2024-01-15T10:00:00Z'),
        certificationCenterName: 'Université de Lyon',
        certificationFramework: 'CORE',
        pixScore: 654,
        status: 'WAITING_FOR_RESULTS',
        comment: null,
        verificationCode: null,
        extraCertificationStatus: null,
        certificateType: null,
      });

      // when
      const screen = await render(<template><ListItem @certificateSummary={{certificateSummary}} /></template>);

      // then
      assert.ok(screen.getByText(t('pages.certifications-list.statuses.not-published')));
      assert.ok(screen.getByText(t('pages.certification-frameworks.CORE')));
      assert.dom(screen.getByText('-')).exists();
      assert.dom(screen.queryByText(t('pages.certificate.verification-code.title'), { exact: false })).doesNotExist();
      assert.dom(screen.queryByText(t('pages.certifications-list.buttons.details'))).doesNotExist();
      assert
        .dom(screen.queryByRole('button', { name: t('pages.certifications-list.buttons.download-attestation') }))
        .doesNotExist();
      assert
        .dom(screen.queryByRole('button', { name: t('pages.certifications-list.buttons.download-certificate') }))
        .doesNotExist();
    });
  });

  module('when status is VALIDATED', function () {
    test('displays validated tag, pix score, details, verification code and actions', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificateSummary = store.createRecord('certificate-summary', {
        certificationStartedAt: new Date('2024-01-15T10:00:00Z'),
        certificationCenterName: 'Université de Lyon',
        certificationFramework: 'CORE',
        pixScore: 654,
        status: 'VALIDATED',
        comment: null,
        verificationCode: 'P-ABC123',
        extraCertificationStatus: null,
        certificateType: 'ATTESTATION',
      });

      // when
      const screen = await render(<template><ListItem @certificateSummary={{certificateSummary}} /></template>);

      // then
      assert.ok(screen.getByText(t('pages.certifications-list.statuses.validated')));
      assert.ok(screen.getByText('654'));
      assert.ok(screen.getByText(/Université de Lyon/));
      assert.ok(screen.getByText(/15\/01\/2024/));
      assert.ok(screen.getByText(/P-ABC123/));
      assert.ok(screen.getByText(t('pages.certifications-list.buttons.details')));
      assert.ok(screen.getByRole('button', { name: t('pages.certifications-list.buttons.download-attestation') }));
    });

    test('displays "download-attestation" when certificateType is ATTESTATION', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificateSummary = store.createRecord('certificate-summary', {
        certificationStartedAt: new Date('2024-01-15T10:00:00Z'),
        certificationCenterName: 'Centre',
        certificationFramework: 'CORE',
        pixScore: 500,
        status: 'VALIDATED',
        verificationCode: 'P-XYZ',
        certificateType: 'ATTESTATION',
      });

      // when
      const screen = await render(<template><ListItem @certificateSummary={{certificateSummary}} /></template>);

      // then
      assert.ok(screen.getByRole('button', { name: t('pages.certifications-list.buttons.download-attestation') }));
    });

    test('displays "download-certificate" when certificateType is CERTIFICATE', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificateSummary = store.createRecord('certificate-summary', {
        certificationStartedAt: new Date('2024-01-15T10:00:00Z'),
        certificationCenterName: 'Centre',
        certificationFramework: 'CORE',
        pixScore: 500,
        status: 'VALIDATED',
        verificationCode: 'P-XYZ',
        certificateType: 'CERTIFICATE',
      });

      // when
      const screen = await render(<template><ListItem @certificateSummary={{certificateSummary}} /></template>);

      // then
      assert.ok(screen.getByRole('button', { name: t('pages.certifications-list.buttons.download-certificate') }));
    });

    module('when there is an error during download', function () {
      test('displays error message', async function (assert) {
        // given
        const fileSaverSaveStub = sinon.stub().rejects(new Error('an error'));

        class FileSaverStub extends Service {
          save = fileSaverSaveStub;
        }

        this.owner.register('service:fileSaver', FileSaverStub);

        const store = this.owner.lookup('service:store');
        const certificateSummary = store.createRecord('certificate-summary', {
          certificationStartedAt: new Date('2024-01-15T10:00:00Z'),
          certificationCenterName: 'Centre',
          certificationFramework: 'CORE',
          pixScore: 500,
          status: 'VALIDATED',
          verificationCode: 'P-XYZ',
          certificateType: 'ATTESTATION',
        });

        const screen = await render(<template><ListItem @certificateSummary={{certificateSummary}} /></template>);

        // when
        await click(screen.getByRole('button', { name: t('pages.certifications-list.buttons.download-attestation') }));

        // then
        assert.ok(screen.getByText(t('common.error')));
      });
    });
  });

  module('when status is REJECTED', function () {
    test('displays rejected tag, details, comment, no pix score and no actions', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificateSummary = store.createRecord('certificate-summary', {
        certificationStartedAt: new Date('2024-01-15T10:00:00Z'),
        certificationCenterName: 'Université de Lyon',
        certificationFramework: 'CORE',
        pixScore: 34,
        status: 'REJECTED',
        comment: 'Vous avez échoué',
        verificationCode: null,
      });

      // when
      const screen = await render(<template><ListItem @certificateSummary={{certificateSummary}} /></template>);

      // then
      assert.ok(screen.getByText(t('pages.certifications-list.statuses.rejected')));
      assert.ok(screen.getByText(t('pages.certifications-list.comment'), { exact: false }));
      assert.dom(screen.queryByText('34')).doesNotExist();
      assert.ok(screen.getByText(/Université de Lyon/));
      assert.ok(screen.getByText(/15\/01\/2024/));
      assert.dom(screen.queryByText(t('pages.certificate.verification-code.title'), { exact: false })).doesNotExist();
      assert.dom(screen.queryByText(t('pages.certifications-list.buttons.details'))).doesNotExist();
      assert
        .dom(screen.queryByRole('button', { name: t('pages.certifications-list.buttons.download-attestation') }))
        .doesNotExist();
    });

    test('does not display comment section when there is no comment', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificateSummary = store.createRecord('certificate-summary', {
        certificationStartedAt: new Date('2024-01-15T10:00:00Z'),
        certificationCenterName: 'Université de Lyon',
        certificationFramework: 'CORE',
        pixScore: 34,
        status: 'REJECTED',
        comment: null,
        verificationCode: null,
      });

      // when
      const screen = await render(<template><ListItem @certificateSummary={{certificateSummary}} /></template>);

      // then
      assert.ok(screen.getByText(t('pages.certifications-list.statuses.rejected')));
      assert.dom(screen.queryByText(t('pages.certifications-list.comment'), { exact: false })).doesNotExist();
    });
  });

  module('when status is CANCELLED', function () {
    test('displays cancelled tag with comment and no actions', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certificateSummary = store.createRecord('certificate-summary', {
        certificationStartedAt: new Date('2024-01-15T10:00:00Z'),
        certificationCenterName: 'Université de Lyon',
        certificationFramework: 'CORE',
        pixScore: 365,
        status: 'CANCELLED',
        comment: 'Votre certification a été annulée',
        verificationCode: null,
      });

      // when
      const screen = await render(<template><ListItem @certificateSummary={{certificateSummary}} /></template>);

      // then
      assert.ok(screen.getByText(t('pages.certifications-list.statuses.cancelled')));
      assert.ok(screen.getByText(t('pages.certification-frameworks.CORE')));
      assert.ok(screen.getByText(t('pages.certifications-list.comment'), { exact: false }));
      assert.dom(screen.queryByText(t('pages.certificate.verification-code.title'), { exact: false })).doesNotExist();
      assert.dom(screen.queryByText(t('pages.certifications-list.buttons.details'))).doesNotExist();
      assert
        .dom(screen.queryByRole('button', { name: t('pages.certifications-list.buttons.download-attestation') }))
        .doesNotExist();
    });
  });

  module('when framework is in userCertificationsActionsDisabledFrameworks feature toggle', function () {
    test('does not display actions', async function (assert) {
      // given
      const featureToggles = this.owner.lookup('service:featureToggles');
      sinon.stub(featureToggles, 'featureToggles').value({ userCertificationsActionsDisabledFrameworks: ['DROIT'] });

      const store = this.owner.lookup('service:store');
      const certificateSummary = store.createRecord('certificate-summary', {
        certificationStartedAt: new Date('2024-01-15T10:00:00Z'),
        certificationCenterName: 'Université de Lyon',
        certificationFramework: 'DROIT',
        pixScore: 654,
        status: 'VALIDATED',
        comment: null,
        verificationCode: 'P-ABC123',
        extraCertificationStatus: null,
        certificateType: 'ATTESTATION',
      });

      // when
      const screen = await render(<template><ListItem @certificateSummary={{certificateSummary}} /></template>);

      // then
      assert.dom(screen.queryByText(t('pages.certifications-list.buttons.details'))).doesNotExist();
      assert
        .dom(screen.queryByRole('button', { name: t('pages.certifications-list.buttons.download-attestation') }))
        .doesNotExist();
    });
  });
});
