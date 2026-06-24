import { visit, within } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../../helpers/authentication';
import setupIntl from '../../helpers/setup-intl';

module('Acceptance | Authenticated | Attestations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  let user;

  hooks.beforeEach(function () {
    user = server.create('user', 'withEmail');
    this.url = this.owner.lookup('service:url');
  });

  module('Authenticated cases as simple user', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticate(user);
    });

    test('can visit /mes-attestations', async function (assert) {
      // when
      await visit('/mes-attestations');
      // then
      assert.strictEqual(currentURL(), '/mes-attestations');
    });

    module('when user has attestations', function (hooks) {
      hooks.beforeEach(function () {
        server.get('/users/:id/attestation-details', () => ({
          data: [
            {
              id: '1',
              type: 'attestation-details',
              attributes: { type: 'SIXTH_GRADE', 'obtained-at': '2025-01-15' },
            },
            {
              id: '2',
              type: 'attestation-details',
              attributes: { type: 'PARENTHOOD', 'obtained-at': '2025-03-20' },
            },
          ],
        }));
      });

      test('displays the attestation cards', async function (assert) {
        // when
        const screen = await visit('/mes-attestations');
        const main = within(screen.getByRole('main'));

        // then
        assert.dom(main.getByRole('heading', { name: t('pages.attestations.title') })).exists();
        assert.strictEqual(main.getAllByRole('listitem').length, 2);
      });
    });

    module('when user has no attestations', function () {
      test('displays an empty list', async function (assert) {
        // when
        const screen = await visit('/mes-attestations');
        const main = within(screen.getByRole('main'));

        // then
        assert.dom(main.getByRole('heading', { name: t('pages.attestations.title') })).exists();
        assert.strictEqual(main.queryAllByRole('listitem').length, 0);
      });
    });
  });

  module('Not authenticated cases', function () {
    test('should redirect to home, when user is not authenticated', async function (assert) {
      // when
      await visit('/mes-attestations');
      assert.strictEqual(currentURL(), '/connexion');
    });
  });
});
