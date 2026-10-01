import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { waitFor } from '@testing-library/dom';
import { t } from 'ember-intl/test-support';
import SelectAttestation from 'pix-admin/components/combined-course-blueprints/select-attestation';
import setupIntlRenderingTest from 'pix-admin/tests/helpers/setup-intl-rendering';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | CombinedCourseBlueprints::SelectAttestation', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display every attestation available in select options', async function (assert) {
    assert.expect(2);
    const attestations = [
      { key: 'KEY_1', label: 'Attestation 1' },
      { key: 'KEY_2', label: 'Attestation 2' },
    ];

    const screen = await render(<template><SelectAttestation @attestations={{attestations}} /></template>);
    await click(
      screen.getByRole('button', { name: t('components.combined-course-blueprints.attestation.select-label') }),
    );

    await waitFor(async () => {
      await screen.findByRole('listbox');

      assert.ok(screen.getByRole('option', { name: 'Attestation 1' }));
      assert.ok(screen.getByRole('option', { name: 'Attestation 2' }));
    });
  });

  test('it should select an attestation', async function (assert) {
    const onChangeStub = sinon.stub();
    const attestations = [
      { id: 1, key: 'KEY_1', label: 'Attestation 1' },
      { id: 2, key: 'KEY_2', label: 'Attestation 2' },
    ];
    const screen = await render(
      <template><SelectAttestation @attestations={{attestations}} @onChange={{onChangeStub}} /></template>,
    );
    await click(
      screen.getByRole('button', { name: t('components.combined-course-blueprints.attestation.select-label') }),
    );
    await screen.findByRole('listbox');

    await click(screen.getByRole('option', { name: 'Attestation 1' }));

    assert.ok(onChangeStub.calledWithExactly(1));
  });
});
