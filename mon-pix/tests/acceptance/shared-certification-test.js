import { visit } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import setupIntl from '../helpers/setup-intl';

module('Acceptance | Certificate verification', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when isV3CertificationPageEnabled feature toggle is enabled', function () {
    module('when session version is v3', function () {
      test('displays v3 shared certificate page', async function (assert) {
        // given
        server.create('feature-toggle', { id: '0', isV3CertificationPageEnabled: true });
        const screen = await visit('/verification-certificat');
        await fillIn(screen.getByRole('textbox', { name: 'Code de vérification * Exemple: P-XXXXXXXX' }), 'P-V3V3V3V3');

        // when
        await click(screen.getByRole('button', { name: 'Vérifier le certificat' }));

        // then
        assert.dom(screen.getByRole('heading', { name: 'Page Certificat V3' })).exists();
      });
    });

    module('when session version is v2', function () {
      test('displays v2 shared certificate page', async function (assert) {
        // given
        server.create('feature-toggle', { id: '0', isV3CertificationPageEnabled: true });
        const screen = await visit('/verification-certificat');
        await fillIn(screen.getByRole('textbox', { name: 'Code de vérification * Exemple: P-XXXXXXXX' }), 'P-123VALID');

        // when
        await click(screen.getByRole('button', { name: 'Vérifier le certificat' }));

        // then
        assert.dom(screen.getByRole('link', { name: t('pages.shared-certification.back-link') })).exists();
        assert.dom(screen.getByRole('heading', { level: 1, name: t('pages.certificate.title') })).exists();
      });
    });
  });

  module('when isV3CertificationPageEnabled feature toggle is disabled', function () {
    module('when session version is v3', function () {
      test('displays v2(old) shared certificate page', async function (assert) {
        // given
        server.create('feature-toggle', { id: '0', isV3CertificationPageEnabled: false });
        const screen = await visit('/verification-certificat');
        await fillIn(screen.getByRole('textbox', { name: 'Code de vérification * Exemple: P-XXXXXXXX' }), 'P-V3V3V3V3');

        // when
        await click(screen.getByRole('button', { name: 'Vérifier le certificat' }));

        // then
        assert.dom(screen.queryByRole('heading', { name: 'Page Certificat V3' })).doesNotExist();
        assert.dom(screen.getByRole('link', { name: t('pages.shared-certification.back-link') })).exists();
        assert.dom(screen.getByRole('heading', { level: 1, name: t('pages.certificate.title') })).exists();
      });
    });
  });
});
