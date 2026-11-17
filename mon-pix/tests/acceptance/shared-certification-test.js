import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'mon-pix/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import setupIntl from '../helpers/setup-intl';

module('Acceptance | Certificate verification', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when algorithm version is v3', function () {
    test('displays v3 shared certificate page', async function (assert) {
      // given
      const screen = await visit('/verification-certificat');
      await fillIn(screen.getByRole('textbox', { name: 'Code de vérification * Exemple: P-XXXXXXXX' }), 'P-V3V3V3V3');

      // when
      await click(screen.getByRole('button', { name: 'Vérifier le certificat' }));

      // then
      assert.dom(screen.getByRole('heading', { name: t('pages.certificate.title') })).exists();
      const globalLevelLabels = screen.getAllByText('Intermédiaire 1');
      assert.strictEqual(globalLevelLabels.length, 2);
    });

    module('when user clicks on the breadcrumb', function () {
      test('should returns to form certificate page', async function (assert) {
        // given
        const screen = await visit('/verification-certificat');
        await fillIn(screen.getByRole('textbox', { name: 'Code de vérification * Exemple: P-XXXXXXXX' }), 'P-V3V3V3V3');
        await click(screen.getByRole('button', { name: 'Vérifier le certificat' }));

        // when
        await click(screen.getByRole('link', { name: t('pages.fill-in-certificate-verification-code.title') }));

        // then
        assert.strictEqual(currentURL(), '/verification-certificat');
      });
    });
  });

  module('when algorithm version is v2', function () {
    test('displays v2 shared certificate page', async function (assert) {
      // given
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
