import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Certificability::Cell', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should not display certifiableAt', async function (assert) {
    this.set('hasComputeOrganizationLearnerCertificabilityEnabled', true);
    // when
    const screen = await render(
      hbs`<Certificability::Cell
  @hideCertifiableDate={{this.hasComputeOrganizationLearnerCertificabilityEnabled}}
  @isCertifiable={{true}}
  @certifiableAt='2023-12-25'
/>`,
    );

    // then
    assert.notOk(screen.queryByText('25/12/2023'));
  });

  test('it should display certifiableAt', async function (assert) {
    this.set('hasComputeOrganizationLearnerCertificabilityEnabled', false);
    // when
    const screen = await render(
      hbs`<Certificability::Cell
  @hideCertifiableDate={{this.hasComputeOrganizationLearnerCertificabilityEnabled}}
  @isCertifiable={{true}}
  @certifiableAt='2023-12-25'
/>`,
    );

    // then
    assert.ok(screen.queryByText('25/12/2023'));
  });
});
