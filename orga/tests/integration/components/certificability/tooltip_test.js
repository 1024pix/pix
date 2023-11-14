import { module, test } from 'qunit';
import { render, fireEvent } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';

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

      fireEvent.mouseOver(screen.getByLabelText(this.intl.t('components.certificability-tooltip.aria-label')));
      await screen.findByRole('tooltip');

      // then
      assert.ok(screen.getByText(this.intl.t('components.certificability-tooltip.content')));
      assert.ok(screen.getByText(this.intl.t('components.certificability-tooltip.from-compute-certificability')));
      assert.notOk(screen.queryByText(this.intl.t('components.certificability-tooltip.from-collect-notice')));
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
      fireEvent.mouseOver(screen.getByLabelText(this.intl.t('components.certificability-tooltip.aria-label')));
      await screen.findByRole('tooltip');

      // then
      assert.ok(screen.getByText(this.intl.t('components.certificability-tooltip.content')));
      assert.ok(screen.getByText(this.intl.t('components.certificability-tooltip.from-collect-notice')));
      assert.notOk(screen.queryByText(this.intl.t('components.certificability-tooltip.from-compute-certificability')));
    });
  });
});
