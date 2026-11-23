import { render } from '@1024pix/ember-testing-library';
import Hexagon from 'mon-pix/components/user-certifications/list-item/hexagon';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | User certifications | List item | Hexagon', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the score hexagon is displayed', function () {
    module('score', function () {
      test('displays the pix score and the pix label when certification is validated', async function (assert) {
        // given
        const pixScore = 654;

        // when
        const screen = await render(
          <template>
            <Hexagon @pixScore={{pixScore}} @isValidated={{true}} @framework="CORE" @certificateType="CERTIFICATE" />
          </template>,
        );

        // then
        assert.dom(screen.getByText('654')).exists();
        assert.dom(screen.getByText(t('common.pix'))).exists();
      });

      test('displays a dash and the pix label when certification is not validated', async function (assert) {
        // given
        const pixScore = 654;

        // when
        const screen = await render(
          <template>
            <Hexagon @pixScore={{pixScore}} @isValidated={{false}} @framework="CORE" @certificateType="CERTIFICATE" />
          </template>,
        );

        // then
        assert.dom(screen.getByText('-')).exists();
        assert.dom(screen.getByText(t('common.pix'))).exists();
      });
    });

    module('CSS classes', function () {
      module('when framework is CORE', function () {
        test('applies only the base hexagon class', async function (assert) {
          // when
          await render(
            <template>
              <Hexagon @pixScore={{500}} @isValidated={{true}} @framework="CORE" @certificateType="CERTIFICATE" />
            </template>,
          );

          // then
          assert.dom('[data-testid="pw-certification-card-result"]').hasClass('certification-result-hexagon');
          assert
            .dom('[data-testid="pw-certification-card-result"]')
            .doesNotHaveClass('certification-result-hexagon--pix-plus-validated');
          assert
            .dom('[data-testid="pw-certification-card-result"]')
            .doesNotHaveClass('certification-result-hexagon--pix-plus-not-validated');
        });
      });

      module('when framework is CLEA', function () {
        test('applies only the base hexagon class', async function (assert) {
          // when
          await render(
            <template>
              <Hexagon @pixScore={{500}} @isValidated={{true}} @framework="CLEA" @certificateType="CERTIFICATE" />
            </template>,
          );

          // then
          assert.dom('[data-testid="pw-certification-card-result"]').hasClass('certification-result-hexagon');
          assert
            .dom('[data-testid="pw-certification-card-result"]')
            .doesNotHaveClass('certification-result-hexagon--pix-plus-validated');
          assert
            .dom('[data-testid="pw-certification-card-result"]')
            .doesNotHaveClass('certification-result-hexagon--pix-plus-not-validated');
        });
      });

      module('when certificate is an ATTESTATION', function () {
        test('applies only the base hexagon class even with a Pix+ framework', async function (assert) {
          // when
          await render(
            <template>
              <Hexagon
                @pixScore={{500}}
                @isValidated={{true}}
                @framework="DROIT"
                @reachedMeshLevel="INDEPENDENT"
                @certificateType="ATTESTATION"
              />
            </template>,
          );

          // then
          assert.dom('[data-testid="pw-certification-card-result"]').hasClass('certification-result-hexagon');
          assert
            .dom('[data-testid="pw-certification-card-result"]')
            .doesNotHaveClass('certification-result-hexagon--pix-plus-validated');
          assert
            .dom('[data-testid="pw-certification-card-result"]')
            .doesNotHaveClass('certification-result-hexagon--pix-plus-not-validated');
        });
      });

      module('when certificate is a Pix+ V3 with the ADMISSIBLE mesh level', function () {
        test('applies the pix-plus-validated modifier', async function (assert) {
          // when
          await render(
            <template>
              <Hexagon
                @pixScore={{500}}
                @isValidated={{true}}
                @framework="DROIT"
                @reachedMeshLevel="ADMISSIBLE"
                @certificateType="CERTIFICATE"
              />
            </template>,
          );

          // then
          assert
            .dom('[data-testid="pw-certification-card-result"]')
            .hasClass('certification-result-hexagon--pix-plus-validated');
          assert
            .dom('[data-testid="pw-certification-card-result"]')
            .doesNotHaveClass('certification-result-hexagon--pix-plus-not-validated');
        });
      });

      module('when certificate is a Pix+ V3 with no reached mesh level', function () {
        test('applies the pix-plus-not-validated modifier', async function (assert) {
          // when
          await render(
            <template>
              <Hexagon
                @pixScore={{500}}
                @isValidated={{false}}
                @framework="DROIT"
                @reachedMeshLevel={{null}}
                @certificateType="CERTIFICATE"
              />
            </template>,
          );

          // then
          assert
            .dom('[data-testid="pw-certification-card-result"]')
            .hasClass('certification-result-hexagon--pix-plus-not-validated');
          assert
            .dom('[data-testid="pw-certification-card-result"]')
            .doesNotHaveClass('certification-result-hexagon--pix-plus-validated');
        });
      });
    });
  });

  module('when the badge image is displayed', function () {
    test('renders the badge image with the framework and reached mesh level in the URL', async function (assert) {
      // when
      await render(
        <template>
          <Hexagon
            @isValidated={{true}}
            @framework="EDU_2ND_DEGRE"
            @reachedMeshLevel="EXPERT"
            @certificateType="CERTIFICATE"
            @badgeUrl="https://exmaple-asset.org/badges-certifies/v3/edu_2nd_degre/expert.svg"
          />
        </template>,
      );

      // then
      assert.dom('img').exists();
      assert.dom('img').hasAttribute('src', /\/badges-certifies\/v3\/edu_2nd_degre\/expert\.svg$/);
    });

    test('does not render the score hexagon', async function (assert) {
      // when
      await render(
        <template>
          <Hexagon
            @pixScore={{500}}
            @isValidated={{true}}
            @framework="DROIT"
            @reachedMeshLevel="INDEPENDENT"
            @certificateType="CERTIFICATE"
            @badgeUrl="super-url"
          />
        </template>,
      );

      // then
      assert.dom('[data-testid="pw-certification-card-result"]').doesNotExist();
    });
  });

  module('when the badge image is not displayed', function () {
    test('falls back to the score hexagon for an ATTESTATION', async function (assert) {
      // when
      await render(
        <template>
          <Hexagon
            @pixScore={{500}}
            @isValidated={{true}}
            @framework="DROIT"
            @reachedMeshLevel="INDEPENDENT"
            @certificateType="ATTESTATION"
          />
        </template>,
      );

      // then
      assert.dom('img').doesNotExist();
      assert.dom('[data-testid="pw-certification-card-result"]').exists();
    });

    test('falls back to the score hexagon for a CORE framework', async function (assert) {
      // when
      await render(
        <template>
          <Hexagon
            @pixScore={{500}}
            @isValidated={{true}}
            @framework="CORE"
            @reachedMeshLevel="INDEPENDENT"
            @certificateType="CERTIFICATE"
          />
        </template>,
      );

      // then
      assert.dom('img').doesNotExist();
      assert.dom('[data-testid="pw-certification-card-result"]').exists();
    });

    test('falls back to the score hexagon for a CLEA framework', async function (assert) {
      // when
      await render(
        <template>
          <Hexagon
            @pixScore={{500}}
            @isValidated={{true}}
            @framework="CLEA"
            @reachedMeshLevel="INDEPENDENT"
            @certificateType="CERTIFICATE"
          />
        </template>,
      );

      // then
      assert.dom('img').doesNotExist();
      assert.dom('[data-testid="pw-certification-card-result"]').exists();
    });

    test('falls back to the score hexagon when reachedMeshLevel is null', async function (assert) {
      // when
      await render(
        <template>
          <Hexagon
            @pixScore={{500}}
            @isValidated={{true}}
            @framework="DROIT"
            @reachedMeshLevel={{null}}
            @certificateType="CERTIFICATE"
          />
        </template>,
      );

      // then
      assert.dom('img').doesNotExist();
      assert.dom('[data-testid="pw-certification-card-result"]').exists();
    });

    test('falls back to the score hexagon when reachedMeshLevel is ADMISSIBLE', async function (assert) {
      // when
      await render(
        <template>
          <Hexagon
            @pixScore={{500}}
            @isValidated={{true}}
            @framework="DROIT"
            @reachedMeshLevel="ADMISSIBLE"
            @certificateType="CERTIFICATE"
          />
        </template>,
      );

      // then
      assert.dom('img').doesNotExist();
      assert.dom('[data-testid="pw-certification-card-result"]').exists();
    });
  });
});
