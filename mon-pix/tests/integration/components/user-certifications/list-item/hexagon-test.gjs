import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import Hexagon from 'mon-pix/components/user-certifications/list-item/hexagon';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | User certifications | List item | Hexagon', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when certification is validated', function () {
    test('displays the pix score and pix label', async function (assert) {
      // given
      const pixScore = 654;
      const isValidated = true;
      const framework = 'CORE';
      const reachedMeshIndex = 0;

      // when
      const screen = await render(
        <template>
          <Hexagon
            @pixScore={{pixScore}}
            @isValidated={{isValidated}}
            @framework={{framework}}
            @reachedMeshIndex={{reachedMeshIndex}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByText('654')).exists();
      assert.dom(screen.getByText(t('common.pix'))).exists();
    });
  });

  module('when certification is not validated', function () {
    test('displays a dash and pix label for core scope', async function (assert) {
      // given
      const pixScore = 654;
      const isValidated = false;
      const framework = 'CORE';
      const reachedMeshIndex = 0;

      // when
      const screen = await render(
        <template>
          <Hexagon
            @pixScore={{pixScore}}
            @isValidated={{isValidated}}
            @framework={{framework}}
            @reachedMeshIndex={{reachedMeshIndex}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByText('-')).exists();
      assert.dom(screen.getByText(t('common.pix'))).exists();
    });
  });

  module('hexagon CSS classes', function () {
    test('has only base class for CORE framework', async function (assert) {
      // given
      const framework = 'CORE';
      const reachedMeshIndex = 0;
      const isValidated = true;
      const pixScore = 500;

      // when
      await render(
        <template>
          <Hexagon
            @pixScore={{pixScore}}
            @isValidated={{isValidated}}
            @framework={{framework}}
            @reachedMeshIndex={{reachedMeshIndex}}
          />
        </template>,
      );

      // then
      assert.dom('[data-testid="pw-certification-card-result"]').hasClass('certification-item__hexagon');
      assert
        .dom('[data-testid="pw-certification-card-result"]')
        .doesNotHaveClass('certification-item__hexagon--pix-plus-validated');
      assert
        .dom('[data-testid="pw-certification-card-result"]')
        .doesNotHaveClass('certification-item__hexagon--pix-plus-not-validated');
    });

    test('has only base class for CLEA framework', async function (assert) {
      // given
      const framework = 'CLEA';
      const reachedMeshIndex = 5;
      const isValidated = true;
      const pixScore = 500;

      // when
      await render(
        <template>
          <Hexagon
            @pixScore={{pixScore}}
            @isValidated={{isValidated}}
            @framework={{framework}}
            @reachedMeshIndex={{reachedMeshIndex}}
          />
        </template>,
      );

      // then
      assert.dom('[data-testid="pw-certification-card-result"]').hasClass('certification-item__hexagon');
      assert
        .dom('[data-testid="pw-certification-card-result"]')
        .doesNotHaveClass('certification-item__hexagon--pix-plus-validated');
      assert
        .dom('[data-testid="pw-certification-card-result"]')
        .doesNotHaveClass('certification-item__hexagon--pix-plus-not-validated');
    });

    test('has validated class for Pix+ v3 with a reachedMeshIndex', async function (assert) {
      // when
      await render(
        <template>
          <Hexagon @isValidated={{true}} @framework="DROIT" @reachedMeshIndex={{0}} @certificateType="CERTIFICATE" />
        </template>,
      );

      // then
      assert
        .dom('[data-testid="pw-certification-card-result"]')
        .hasClass('certification-item__hexagon--pix-plus-validated');
    });

    test('has not-validated class for Pix+ v3 with null reachedMeshIndex', async function (assert) {
      // given
      const reachedMeshIndex = null;

      // when
      await render(
        <template>
          <Hexagon
            @isValidated={{true}}
            @framework="DROIT"
            @reachedMeshIndex={{reachedMeshIndex}}
            @certificateType="CERTIFICATE"
          />
        </template>,
      );

      // then
      assert
        .dom('[data-testid="pw-certification-card-result"]')
        .hasClass('certification-item__hexagon--pix-plus-not-validated');
    });
  });
});
