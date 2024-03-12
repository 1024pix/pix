import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import setupIntl from '../helpers/setup-intl';

module('Acceptance | Certificate verification', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('display a verification section', async function (assert) {
    // given & when
    const screen = await visit('/verification-certificat');

    // then
    assert.dom(screen.getByRole('heading', { name: 'Vérifier un certificat Pix' })).exists();
    assert
      .dom(
        screen.getByText(
          'La certification Pix atteste d’un niveau de maîtrise des compétences numériques : saisissez ci-après le "code de vérification" du certificat Pix à vérifier.',
        ),
      )
      .exists();
    assert.dom(screen.getByRole('textbox', { name: 'Code de vérification (P-XXXXXXXX)' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Vérifier le certificat' })).exists();
  });

  module('when certificate verification code is valid', function () {
    test('redirects to certificate details page', async function (assert) {
      // given
      const screen = await visit('/verification-certificat');
      await fillIn(screen.getByRole('textbox', { name: 'Code de vérification (P-XXXXXXXX)' }), 'P-123VALID');

      // when
      await click(screen.getByRole('button', { name: 'Vérifier le certificat' }));

      // then
      assert.strictEqual(currentURL(), '/partage-certificat/200');
    });
  });

  module('when certificate verification code is wrong', function () {
    test('does not redirect to certificate details page', async function (assert) {
      // given
      const screen = await visit('/verification-certificat');
      await fillIn(screen.getByRole('textbox', { name: 'Code de vérification (P-XXXXXXXX)' }), 'P-12345678');

      // when
      await click(screen.getByRole('button', { name: 'Vérifier le certificat' }));

      // then
      assert.strictEqual(currentURL(), '/verification-certificat');
    });

    test('shows error message', async function (assert) {
      // given
      const screen = await visit('/verification-certificat');
      await fillIn(screen.getByRole('textbox', { name: 'Code de vérification (P-XXXXXXXX)' }), 'P-12345678');

      // when
      await click(screen.getByRole('button', { name: 'Vérifier le certificat' }));

      // then
      assert.dom(screen.getByText("Il n'y a pas de certificat Pix correspondant.")).exists();
    });
  });

  module('when user visits /partage-certificat/200 directly', function () {
    test('redirects to /verification-certificat', async function (assert) {
      // given & when
      await visit('/partage-certificat/200');

      // then
      assert.strictEqual(currentURL(), '/verification-certificat');
    });
  });
});
