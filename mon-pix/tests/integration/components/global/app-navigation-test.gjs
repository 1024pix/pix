import { render, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { settled } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import AppNavigation from 'mon-pix/components/global/app-navigation';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubCurrentUserService } from '../../../helpers/service-stubs';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Global | App Navigation', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('logo', function () {
    test('it displays the Pix logo with a link to homepage', async function (assert) {
      // when
      const screen = await render(<template><AppNavigation /></template>);

      // then
      assert.strictEqual(screen.getAllByRole('img').length, 1);

      const homepageLink = screen.getByRole('link', { name: t('navigation.homepage') });
      const pixLogo = within(homepageLink).getByRole('img');
      assert.dom(pixLogo).exists();
    });
  });

  module('links list', function () {
    module('when user is connected', function () {
      test('it should always display a links list', async function (assert) {
        // given
        _stubCurrentUser(this.owner);

        // when
        const screen = await render(<template><AppNavigation /></template>);

        // then
        const nav = screen.getByLabelText('navigation principale');

        assert.dom(within(nav).getByRole('link', { name: t('navigation.main.dashboard') })).exists();
        assert.dom(within(nav).getByRole('link', { name: t('navigation.main.skills') })).exists();
        assert.dom(within(nav).getByRole('link', { name: t('navigation.main.start-certification') })).exists();
        assert.dom(within(nav).getByRole('link', { name: t('navigation.main.tutorials') })).exists();

        assert.dom(within(nav).queryByRole('link', { name: t('navigation.user.tests') })).doesNotExist();
        assert.dom(within(nav).queryByRole('link', { name: t('navigation.main.trainings') })).doesNotExist();

        assert.dom(within(nav).queryByRole('link', { name: t('navigation.not-logged.sign-in') })).doesNotExist();
        assert.dom(within(nav).queryByRole('link', { name: t('navigation.not-logged.sign-up') })).doesNotExist();
      });

      module('when user has started assessments', function () {
        test('it should display a specific link', async function (assert) {
          // given
          _stubCurrentUser(this.owner, { hasAssessmentParticipations: true });

          // when
          const screen = await render(<template><AppNavigation /></template>);

          // then
          const nav = screen.getByLabelText('navigation principale');
          assert.dom(within(nav).getByRole('link', { name: t('navigation.user.tests') })).exists();
        });
      });

      module('when user has recommended trainings', function () {
        test('it should display a specific link', async function (assert) {
          // given
          _stubCurrentUser(this.owner, { hasRecommendedTrainings: true });

          // when
          const screen = await render(<template><AppNavigation /></template>);

          // then
          const nav = screen.getByLabelText('navigation principale');
          assert.dom(within(nav).getByRole('link', { name: t('navigation.main.trainings') })).exists();
        });
      });

      module('attestation nav item', function (hooks) {
        const userId = '123';
        const cacheKey = `pix-has-attestations-${userId}`;

        hooks.afterEach(function () {
          localStorage.removeItem(cacheKey);
        });

        module('when localStorage has the cache set', function (hooks) {
          hooks.beforeEach(function () {
            localStorage.setItem(cacheKey, 'true');
          });

          test('it shows the attestation nav item without calling the store', async function (assert) {
            // given
            const findAllStub = sinon.stub();
            class StoreStub extends Service {
              findAll = findAllStub;
            }
            this.owner.register('service:store', StoreStub);
            stubCurrentUserService(
              this.owner,
              { id: userId, firstName: 'Banana', lastName: 'Split', email: 'banana.split@example.net' },
              { withStoreStubbed: true },
            );

            // when
            const screen = await render(<template><AppNavigation /></template>);

            // then
            const nav = screen.getByLabelText('navigation principale');
            assert.dom(within(nav).getByRole('link', { name: t('navigation.main.attestations') })).exists();
            sinon.assert.notCalled(findAllStub);
          });
        });

        module('when localStorage does not have the cache', function () {
          test('shows the attestation nav item when user has attestations and caches the result', async function (assert) {
            // given
            const findAllStub = sinon.stub().resolves([{ id: '1' }]);
            class StoreStub extends Service {
              findAll = findAllStub;
            }
            this.owner.register('service:store', StoreStub);
            stubCurrentUserService(
              this.owner,
              { id: userId, firstName: 'Banana', lastName: 'Split', email: 'banana.split@example.net' },
              { withStoreStubbed: true },
            );

            // when
            const screen = await render(<template><AppNavigation /></template>);
            await settled();

            // then
            const nav = screen.getByLabelText('navigation principale');
            assert.dom(within(nav).getByRole('link', { name: t('navigation.main.attestations') })).exists();
            assert.strictEqual(localStorage.getItem(cacheKey), 'true');
          });

          test('does not show the attestation nav item when user has no attestations', async function (assert) {
            // given
            const findAllStub = sinon.stub().resolves([]);
            class StoreStub extends Service {
              findAll = findAllStub;
            }
            this.owner.register('service:store', StoreStub);
            stubCurrentUserService(
              this.owner,
              { id: userId, firstName: 'Banana', lastName: 'Split', email: 'banana.split@example.net' },
              { withStoreStubbed: true },
            );

            // when
            const screen = await render(<template><AppNavigation /></template>);
            await settled();

            // then
            const nav = screen.getByLabelText('navigation principale');
            assert.dom(within(nav).queryByRole('link', { name: t('navigation.main.attestations') })).doesNotExist();
            assert.strictEqual(localStorage.getItem(cacheKey), null);
          });
        });
      });
    });

    module('when user is not connected', function () {
      test('it should only display sign-in and sign-up links', async function (assert) {
        // when
        const screen = await render(<template><AppNavigation /></template>);

        // then
        const nav = screen.getByLabelText('navigation principale');

        assert.dom(within(nav).getByRole('link', { name: t('navigation.not-logged.sign-in') })).exists();
        assert.dom(within(nav).getByRole('link', { name: t('navigation.not-logged.sign-up') })).exists();

        assert.dom(within(nav).queryByRole('link', { name: t('navigation.main.dashboard') })).doesNotExist();
        assert.dom(within(nav).queryByRole('link', { name: t('navigation.main.skills') })).doesNotExist();
        assert.dom(within(nav).queryByRole('link', { name: t('navigation.main.start-certification') })).doesNotExist();
        assert.dom(within(nav).queryByRole('link', { name: t('navigation.main.tutorials') })).doesNotExist();
        assert.dom(within(nav).queryByRole('link', { name: t('navigation.user.tests') })).doesNotExist();
        assert.dom(within(nav).queryByRole('link', { name: t('navigation.main.trainings') })).doesNotExist();
      });
    });
  });

  module('footer', function () {
    test('on tablet or desktop, it should display only the help link', async function (assert) {
      // given & when
      _stubCurrentUser(this.owner);

      class MediaServiceStub extends Service {
        isMobile = false;
      }
      this.owner.register('service:media', MediaServiceStub);

      const screen = await render(<template><AppNavigation /></template>);

      // then
      const footer = screen.getByRole('contentinfo');
      assert.strictEqual(footer.children.length, 1);
      assert.dom(within(footer).getByRole('link', { name: t('navigation.footer.help-center') })).exists();
    });

    test('on mobile, it should also display extra links', async function (assert) {
      // given & when
      _stubCurrentUser(this.owner);

      class MediaServiceStub extends Service {
        isMobile = true;
      }
      this.owner.register('service:media', MediaServiceStub);

      const screen = await render(<template><AppNavigation /></template>);

      // then
      const footer = screen.getByRole('contentinfo');
      assert.dom(within(footer).getByRole('link', { name: t('navigation.main.code') })).exists();
      assert.dom(within(footer).getByText('Banana Split')).exists();
      assert.dom(within(footer).getByRole('link', { name: t('navigation.user.account') })).exists();
      assert.dom(within(footer).getByRole('link', { name: t('navigation.user.certifications') })).exists();
      assert.dom(within(footer).getByRole('link', { name: t('navigation.user.sign-out') })).exists();
      assert.dom(within(footer).getByRole('link', { name: t('navigation.footer.help-center') })).exists();
    });
  });
});

function _stubCurrentUser(owner, extraArgs) {
  stubCurrentUserService(
    owner,
    {
      firstName: 'Banana',
      lastName: 'Split',
      email: 'banana.split@example.net',
      ...extraArgs,
    },
    { withStoreStubbed: false },
  );
}
