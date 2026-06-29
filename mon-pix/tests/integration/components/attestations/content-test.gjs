import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import AttestationContent from 'mon-pix/components/attestations/content';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Attestations | content', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    class SessionStub extends Service {
      data = { authenticated: { access_token: 'token', user_id: '1' } };
    }

    class FileSaverStub extends Service {
      save = sinon.stub().resolves();
    }

    class PixMetricsStub extends Service {
      trackEvent = sinon.stub();
    }

    this.owner.register('service:session', SessionStub);
    this.owner.register('service:fileSaver', FileSaverStub);
    this.owner.register('service:pixMetrics', PixMetricsStub);
  });

  test('it renders attestation cards for each attestation detail', async function (assert) {
    // given
    const attestationsDetails = [
      { key: 'SIXTH_GRADE', obtainedAt: new Date('2025-01-15') },
      { key: 'PARENTHOOD', obtainedAt: new Date('2025-03-20') },
    ];

    // when
    const screen = await render(
      <template><AttestationContent @attestationsDetails={{attestationsDetails}} /></template>,
    );

    // then
    assert.dom(screen.getByRole('heading', { level: 1 })).hasText(t('pages.attestations.title'));
    assert.strictEqual(screen.getAllByRole('listitem').length, 2);
  });

  test('it renders an empty list when there are no attestation details', async function (assert) {
    // given
    const attestationsDetails = [];

    // when
    const screen = await render(
      <template><AttestationContent @attestationsDetails={{attestationsDetails}} /></template>,
    );

    // then
    assert.dom(screen.getByRole('heading', { level: 1 })).hasText(t('pages.attestations.title'));
    assert.dom(screen.getByRole('list')).exists();
    assert.strictEqual(screen.queryAllByRole('listitem').length, 0);
  });

  test('clicking download calls fileSaver with the correct url and token', async function (assert) {
    // given
    const fileSaverSaveStub = sinon.stub().resolves();
    class FileSaverStub extends Service {
      save = fileSaverSaveStub;
    }
    this.owner.register('service:fileSaver', FileSaverStub);

    const attestationsDetails = [{ key: 'SIXTH_GRADE', obtainedAt: new Date('2025-01-15') }];

    const screen = await render(
      <template><AttestationContent @attestationsDetails={{attestationsDetails}} /></template>,
    );

    // when
    await click(screen.getByRole('button', { name: t('pages.certificate.actions.download-attestation') }));

    // then
    sinon.assert.calledOnce(fileSaverSaveStub);
    const { url, token } = fileSaverSaveStub.firstCall.args[0];
    assert.strictEqual(url, '/api/users/1/attestations/SIXTH_GRADE');
    assert.strictEqual(token, 'token');
  });

  test('clicking download sends metrics', async function (assert) {
    // given
    const trackEventStub = sinon.stub();
    class PixMetricsStub extends Service {
      trackEvent = trackEventStub;
    }
    this.owner.register('service:pixMetrics', PixMetricsStub);

    const attestationsDetails = [{ key: 'SIXTH_GRADE', obtainedAt: new Date('2025-01-15') }];

    const screen = await render(
      <template><AttestationContent @attestationsDetails={{attestationsDetails}} /></template>,
    );

    // when
    await click(screen.getByRole('button', { name: t('pages.certificate.actions.download-attestation') }));

    // then
    sinon.assert.calledOnce(trackEventStub);
    sinon.assert.calledWith(trackEventStub, 'Clic sur le bouton Télécharger (attestation)', {
      disabled: true,
      category: 'Page Mes Attestations',
      action: 'Cliquer sur le bouton Télécharger (attestation)',
    });
    assert.ok(true);
  });
});
