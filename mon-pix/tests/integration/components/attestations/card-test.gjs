import { render } from '@1024pix/ember-testing-library';
import AttestationCard from 'mon-pix/components/attestations/card';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Attestations | card', function (hooks) {
  setupIntlRenderingTest(hooks);

  test(`it renders attestation card with label`, async function (assert) {
    const attestationDetail = {
      obtainedAt: '2025-01-15',
      label: 'Label',
      key: 'key',
    };

    const downloadAttestation = () => {};

    const screen = await render(
      <template>
        <AttestationCard @attestationDetail={{attestationDetail}} @downloadAttestation={{downloadAttestation}} />
      </template>,
    );

    assert.dom(screen.getByRole('heading', { level: 2 })).hasText(attestationDetail.label);
  });
  test('it displays correct SVG for PARENTHOOD type', async function (assert) {
    const attestationDetail = {
      obtainedAt: '2025-01-15',
      label: 'Parentalité',
      key: 'PARENTHOOD',
    };

    const downloadAttestation = () => {};

    await render(
      <template>
        <AttestationCard @attestationDetail={{attestationDetail}} @downloadAttestation={{downloadAttestation}} />
      </template>,
    );

    assert.dom('img').hasAttribute('src', '/images/illustrations/attestations/PARENTHOOD.svg');
  });

  test('it displays correct SVG for SIXTH_GRADE type', async function (assert) {
    const attestationDetail = {
      obtainedAt: '2025-01-15',
      label: 'Parentalité',
      key: 'SIXTH_GRADE',
    };

    const downloadAttestation = () => {};

    await render(
      <template>
        <AttestationCard @attestationDetail={{attestationDetail}} @downloadAttestation={{downloadAttestation}} />
      </template>,
    );

    assert.dom('img').hasAttribute('src', '/images/illustrations/attestations/SIXTH_GRADE.svg');
  });
});
