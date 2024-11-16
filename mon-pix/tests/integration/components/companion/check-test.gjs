import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import CompanionCheck from 'mon-pix/components/companion/check';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Companion | check', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when extension is detected', function () {
    module('when the version is known', function () {
      module(
        'when the extension version is equal to or greater than the minimal version for certification session',
        function () {
          test('it displays the success page', async function (assert) {
            // given
            class PixCompanionStub extends Service {
              checkExtensionIsEnabled = sinon.stub();
              version = '0.0.5';
              hasMinimalVersionForCertification = true;
            }

            this.owner.register('service:pix-companion', PixCompanionStub);

            // when
            const screen = await render(<template><CompanionCheck /></template>);

            // then
            assert
              .dom(
                screen.getByRole('heading', {
                  level: 1,
                  name: 'Extension Pix Companion (version 0.0.5)installée et activée.',
                }),
              )
              .exists();
          });
        },
      );

      module(
        'when the current extension version is not at least the minimal version for certification session',
        function () {
          test('it displays the error page', async function (assert) {
            // given
            class PixCompanionStub extends Service {
              checkExtensionIsEnabled = sinon.stub();
              hasMinimalVersionForCertification = false;
            }

            this.owner.register('service:pix-companion', PixCompanionStub);

            // when
            const screen = await render(<template><CompanionCheck /></template>);

            // then
            assert
              .dom(
                screen.getByRole('heading', {
                  level: 1,
                  name: "Extension Pix Companion non installée/activée ou dans une version obsolète, qui n'est plus supportée pour l'accès en session de certification.",
                }),
              )
              .exists();
            assert
              .dom(screen.getByRole('link', { name: 'Accéder à la documentation' }))
              .hasAttribute('href', 'https://cloud.pix.fr/s/KocingDC4mFJ3R6');
          });
        },
      );
    });

    module('when the version is unknown', function () {
      test('it displays the success page', async function (assert) {
        // given
        class PixCompanionStub extends Service {
          checkExtensionIsEnabled = sinon.stub();
          version = undefined;
          hasMinimalVersionForCertification = true;
        }

        this.owner.register('service:pix-companion', PixCompanionStub);

        // when
        const screen = await render(<template><CompanionCheck /></template>);

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              level: 1,
              name: 'Extension Pix Companioninstallée et activée.',
            }),
          )
          .exists();
      });
    });
  });

  module('when extension is not detected', function () {
    test('it displays the error page', async function (assert) {
      // given
      class PixCompanionStub extends Service {
        checkExtensionIsEnabled = sinon.stub();
        currentExtensionVersion = null;
        hasMinimalVersionForCertification = false;
      }

      this.owner.register('service:pix-companion', PixCompanionStub);

      // when
      const screen = await render(<template><CompanionCheck /></template>);

      // then
      assert
        .dom(
          screen.getByRole('heading', {
            level: 1,
            name: "Extension Pix Companion non installée/activée ou dans une version obsolète, qui n'est plus supportée pour l'accès en session de certification.",
          }),
        )
        .exists();
    });
  });
});
