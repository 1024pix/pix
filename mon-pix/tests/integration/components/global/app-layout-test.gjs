import { render, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import AppLayout from 'mon-pix/components/global/app-layout';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import { stubCurrentUserService, stubSessionService } from '../../../helpers/service-stubs';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Global | App Layout', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('navigation', function () {
    test('it should exist 2 skip links', async function (assert) {
      // given & when
      const screen = await render(<template><AppLayout @displayFullLayout={{true}} /></template>);

      // then
      const skipLinks = screen.getAllByRole('link', { name: /Aller/ });

      assert.strictEqual(skipLinks.length, 2);
    });

    test('it should exist an aside block', async function (assert) {
      // given & when
      const screen = await render(<template><AppLayout @displayFullLayout={{true}} /></template>);

      // then
      const aside = screen.getByRole('complementary');
      const homepageLink = within(aside).getByRole('link', { name: t('navigation.homepage') });
      const pixLogo = within(homepageLink).getByRole('img');
      assert.dom(pixLogo).exists();
    });
  });

  module('main header', function () {
    module('when user is not connected', function () {
      test('it should not be displayed', async function (assert) {
        // given & when
        class MediaServiceStub extends Service {
          isMobile = true;
        }
        this.owner.register('service:media', MediaServiceStub);

        const screen = await render(<template><AppLayout @displayFullLayout={{true}} /></template>);

        // then
        assert.dom(screen.queryByRole('link', { name: '100 Pix' })).doesNotExist();
      });
    });

    module('when user is connected', function (hooks) {
      hooks.beforeEach(function () {
        stubSessionService(this.owner, { isAuthenticated: true });
        stubCurrentUserService(
          this.owner,
          {
            firstName: 'Banana',
            lastName: 'Split',
            email: 'banana.split@example.net',
            profile: { pixScore: 100 },
          },
          { withStoreStubbed: false },
        );
      });

      test('it should display the user pix score', async function (assert) {
        // given & when
        const screen = await render(<template><AppLayout @displayFullLayout={{true}} /></template>);

        // then
        assert.dom(screen.getByRole('link', { name: '100 Pix' })).exists();
      });

      test('it should display a campaign code link', async function (assert) {
        // given & when
        const screen = await render(<template><AppLayout @displayFullLayout={{true}} /></template>);

        // then
        assert.dom(screen.getByRole('link', { name: t('navigation.main.code') })).exists();
      });

      test('it should display the UserLoggedMenu component', async function (assert) {
        // given & when
        const screen = await render(<template><AppLayout @displayFullLayout={{true}} /></template>);

        // then
        assert
          .dom(
            screen.getByRole('button', {
              name: `Banana ${t('navigation.user-logged-menu.details')}`,
            }),
          )
          .exists();
      });

      module('on mobile device', function () {
        test('it should not be displayed', async function (assert) {
          // given & when
          class MediaServiceStub extends Service {
            isMobile = true;
          }
          this.owner.register('service:media', MediaServiceStub);

          const screen = await render(<template><AppLayout @displayFullLayout={{true}} /></template>);

          // then
          assert.dom(screen.queryByRole('link', { name: '100 Pix' })).doesNotExist();
        });
      });
    });
  });

  module('main content', function () {
    test('it should display yield content', async function (assert) {
      // given & when
      const screen = await render(
        <template>
          <AppLayout>{{t "application.description"}}</AppLayout>
        </template>,
      );

      // then
      assert.dom(screen.getByText(t('application.description'))).exists();
    });
  });

  module('footer', function () {
    test('it should display the footer component', async function (assert) {
      // given & when
      const screen = await render(<template><AppLayout @displayFullLayout={{true}} /></template>);

      // then
      assert.dom(screen.getByText(`${t('navigation.copyrights')} ${new Date().getFullYear()} Pix`)).exists();
    });
  });
});
