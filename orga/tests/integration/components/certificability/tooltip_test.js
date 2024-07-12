import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Certificability::Tooltip', function (hooks) {
  setupIntlRenderingTest(hooks);

  module("when organization's has certificability feature enabled", function () {
    test('should display certificability information banner', async function (assert) {
      this.set('hasComputeOrganizationLearnerCertificabilityEnabled', true);

      // when
      const screen = await render(
        hbs`<Certificability::Tooltip
  @hasComputeOrganizationLearnerCertificabilityEnabled={{this.hasComputeOrganizationLearnerCertificabilityEnabled}}
/>`,
      );

      // then
      assert.ok(screen.getByText(t('components.certificability-tooltip.content')));
      assert.ok(screen.getByText(t('components.certificability-tooltip.from-compute-certificability')));
      assert.notOk(screen.queryByText(t('components.certificability-tooltip.from-collect-notice')));
    });
  });

  module("when organization's has certificability feature disabled", function () {
    test('should not display certificability information banner', async function (assert) {
      this.set('hasComputeOrganizationLearnerCertificabilityEnabled', false);

      // when
      const screen = await render(
        hbs`<Certificability::Tooltip
  @hasComputeOrganizationLearnerCertificabilityEnabled={{this.hasComputeOrganizationLearnerCertificabilityEnabled}}
/>`,
      );

      // then
      assert.ok(screen.getByText(t('components.certificability-tooltip.content')));
      assert.ok(screen.getByText(t('components.certificability-tooltip.from-collect-notice')));
      assert.notOk(screen.queryByText(t('components.certificability-tooltip.from-compute-certificability')));
    });
  });
});
