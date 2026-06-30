import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import DownloadPdf from 'mon-pix/components/certifications/certificate-information/download-pdf';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubCurrentUserService } from '../../../../helpers/service-stubs';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | Certificate information | download pdf', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display certificate information', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const certification = store.createRecord('certification', {
      birthdate: '2000-01-22',
      birthplace: 'Paris',
      firstName: 'Jean',
      lastName: 'Bon',
      certificationDate: new Date('2018-02-15T15:15:52Z'),
      deliveredAt: new Date('2018-02-17T15:15:52Z'),
      certificationCenter: 'Université de Lyon',
      pixScore: 12,
      maxReachableLevelOnCertificationDate: new Date('2018-02-15T15:15:52Z'),
      verificationCode: 'P-1871389473',
      algorithmEngineVersion: 3,
    });

    // when
    const screen = await render(<template><DownloadPdf @certificate={{certification}} /></template>);

    // then
    assert.dom(screen.getByRole('button', { name: t('pages.certificate.actions.download-certificate') })).exists();
    assert.dom(screen.getByRole('button', { name: t('pages.certificate.verification-code.copy') })).exists();
    assert
      .dom(screen.getByRole('heading', { name: t('pages.certificate.verification-code.share'), level: 2 }))
      .exists();
    assert.dom(screen.getByText(certification.verificationCode)).exists();
  });

  module('when algorithm engine version is v2', function () {
    test('should display attestation on download button', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Bon',
        certificationDate: new Date('2018-02-15T15:15:52Z'),
        deliveredAt: new Date('2018-02-17T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        pixScore: 12,
        maxReachableLevelOnCertificationDate: new Date('2018-02-15T15:15:52Z'),
        verificationCode: 'P-1871389473',
        algorithmEngineVersion: 2,
      });

      // when
      const screen = await render(<template><DownloadPdf @certificate={{certification}} /></template>);

      // then
      assert.dom(screen.getByRole('button', { name: t('pages.certificate.actions.download-attestation') })).exists();
      assert.dom(screen.getByRole('button', { name: t('pages.certificate.verification-code.copy') })).exists();
      assert
        .dom(screen.getByRole('heading', { name: t('pages.certificate.verification-code.share'), level: 2 }))
        .exists();
      assert.dom(screen.getByText(certification.verificationCode)).exists();
    });
  });

  module('when domain is french', function () {
    test('should call file saver with isFrenchDomainExtension set to true in url', async function (assert) {
      // given
      stubCurrentUserService(this.owner);
      const domainService = this.owner.lookup('service:currentDomain');
      sinon.stub(domainService, 'getExtension').returns('fr');

      const fileSaverSaveStub = sinon.stub();
      class FileSaverStub extends Service {
        save = fileSaverSaveStub;
      }
      this.owner.register('service:fileSaver', FileSaverStub);

      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', { id: 1234, algorithmEngineVersion: 3 });

      const screen = await render(<template><DownloadPdf @certificate={{certification}} /></template>);

      // when
      await click(screen.getByRole('button', { name: t('pages.certificate.actions.download-certificate') }));

      // then
      sinon.assert.calledWith(
        fileSaverSaveStub,
        sinon.match({ url: '/api/attestation/1234?isFrenchDomainExtension=true&lang=fr' }),
      );
      assert.ok(true);
    });
  });

  module('when domain is not french', function () {
    test('should call file saver with isFrenchDomainExtension set to false in url', async function (assert) {
      // given
      stubCurrentUserService(this.owner);
      const domainService = this.owner.lookup('service:currentDomain');
      sinon.stub(domainService, 'getExtension').returns('org');

      const fileSaverSaveStub = sinon.stub();
      class FileSaverStub extends Service {
        save = fileSaverSaveStub;
      }
      this.owner.register('service:fileSaver', FileSaverStub);

      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', { id: 1234, algorithmEngineVersion: 3 });

      const screen = await render(<template><DownloadPdf @certificate={{certification}} /></template>);

      // when
      await click(screen.getByRole('button', { name: t('pages.certificate.actions.download-certificate') }));

      // then
      sinon.assert.calledWith(
        fileSaverSaveStub,
        sinon.match({ url: '/api/attestation/1234?isFrenchDomainExtension=false&lang=fr' }),
      );
      assert.ok(true);
    });
  });

  module('when there is an error during the download of the attestation', function () {
    test('should show the common error message', async function (assert) {
      // given
      stubCurrentUserService(this.owner);
      const fileSaverSaveStub = sinon.stub();

      class FileSaverStub extends Service {
        save = fileSaverSaveStub;
      }

      this.owner.register('service:fileSaver', FileSaverStub);

      fileSaverSaveStub.rejects(new Error('an error message'));

      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Bon',
        certificationDate: new Date('2018-02-15T15:15:52Z'),
        deliveredAt: new Date('2018-02-17T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        pixScore: 12,
        maxReachableLevelOnCertificationDate: new Date('2018-02-15T15:15:52Z'),
        algorithmEngineVersion: 3,
      });

      const screen = await render(<template><DownloadPdf @certificate={{certification}} /></template>);

      // when
      await click(screen.getByRole('button', { name: t('pages.certificate.actions.download-certificate') }));

      // then
      assert.ok(screen.getByText(t('common.error')));
    });
  });
});
