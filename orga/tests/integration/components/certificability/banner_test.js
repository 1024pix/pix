import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Certificability::Banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  module("when organization's has certificability feature enabled", function () {
    test('should display certificability information banner', async function (assert) {
      this.set('hasComputeOrganizationLearnerCertificabilityEnabled', true);

      // when
      const screen = await render(
        hbs`<Certificability::Banner
  @display={{this.hasComputeOrganizationLearnerCertificabilityEnabled}}
>toto</Certificability::Banner>`,
      );
      // then
      assert.ok(screen.getByText('toto'));
    });
  });

  module("when organization's has certificability feature disabled", function () {
    test('should not display certificability information banner', async function (assert) {
      this.set('hasComputeOrganizationLearnerCertificabilityEnabled', false);

      // when
      const screen = await render(
        hbs`<Certificability::Banner
  @display={{this.hasComputeOrganizationLearnerCertificabilityEnabled}}
>toto</Certificability::Banner>`,
      );

      // then
      assert.notOk(screen.queryByText('toto'));
    });
  });
});
