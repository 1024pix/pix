import { render } from '@1024pix/ember-testing-library';
import Tooltip from 'pix-orga/components/certificability/tooltip';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Certificability::Tooltip', function (hooks) {
  setupIntlRenderingTest(hooks);

  module("when organization's has certificability feature enabled", function () {
    test('should display certificability information banner', async function (assert) {
      const hasComputeOrganizationLearnerCertificabilityEnabled = true;

      // when
      const screen = await render(
        <template>
          <Tooltip
            @hasComputeOrganizationLearnerCertificabilityEnabled={{hasComputeOrganizationLearnerCertificabilityEnabled}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByText(t('components.certificability-tooltip.content')));
      assert.ok(screen.getByText(t('components.certificability-tooltip.from-compute-certificability')));
      assert.notOk(screen.queryByText(t('components.certificability-tooltip.from-collect-notice')));
    });
  });

  module("when organization's has certificability feature disabled", function () {
    test('should not display certificability information banner', async function (assert) {
      const hasComputeOrganizationLearnerCertificabilityEnabled = false;

      // when
      const screen = await render(
        <template>
          <Tooltip
            @hasComputeOrganizationLearnerCertificabilityEnabled={{hasComputeOrganizationLearnerCertificabilityEnabled}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByText(t('components.certificability-tooltip.content')));
      assert.ok(screen.getByText(t('components.certificability-tooltip.from-collect-notice')));
      assert.notOk(screen.queryByText(t('components.certificability-tooltip.from-compute-certificability')));
    });
  });
});
