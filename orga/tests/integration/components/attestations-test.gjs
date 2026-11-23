import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import Attestations, {
  PARENTHOOD_ATTESTATION_KEY,
  SIXTH_GRADE_ATTESTATION_KEY,
} from 'pix-orga/components/attestations';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | Attestations', function (hooks) {
  setupIntlRenderingTest(hooks);
  const availableAttestations = [{ key: SIXTH_GRADE_ATTESTATION_KEY, label: '6ème' }];

  module('when organization has divisions, SIXTH_GRADE attestation and another attestation', function () {
    test('it displays both way to download attestations', async function (assert) {
      // given
      const noop = sinon.stub();
      const availableAttestations2 = [
        { key: SIXTH_GRADE_ATTESTATION_KEY, label: '6ème' },
        { key: PARENTHOOD_ATTESTATION_KEY, label: 'Parentalité' },
      ];

      const divisions = [];

      // when
      const screen = await render(
        <template>
          <Attestations
            @divisions={{divisions}}
            @onSubmit={{noop}}
            @onFilter={{noop}}
            @availableAttestations={{availableAttestations2}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByText(t('pages.attestations.basic-description')));
    });
  });

  module('when organization has divisions and SIXTH_GRADE attestation', function () {
    test('it should display all specifics information for divisions', async function (assert) {
      // given
      const noop = sinon.stub();
      const onSubmit = sinon.stub();
      const divisions = [];

      // when
      const screen = await render(
        <template>
          <Attestations
            @divisions={{divisions}}
            @onSubmit={{onSubmit}}
            @onFilter={{noop}}
            @availableAttestations={{availableAttestations}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByRole('heading', { name: t('pages.attestations.title') }));
      assert.ok(screen.getByRole('button', { name: t('pages.attestations.select-divisions-label') }));
      assert.ok(screen.getByRole('button', { name: t('pages.attestations.download-attestations-button') }));
    });

    test('download button is disabled if there is no selected divisions', async function (assert) {
      // given
      const noop = sinon.stub();
      const divisions = [];

      // when
      const screen = await render(
        <template>
          <Attestations
            @divisions={{divisions}}
            @onSubmit={{noop}}
            @onFilter={{noop}}
            @availableAttestations={{availableAttestations}}
          />
        </template>,
      );

      // then
      const downloadButton = await screen.getByRole('button', {
        name: t('pages.attestations.download-attestations-button'),
      });
      assert.dom(downloadButton).hasAttribute('aria-disabled');
    });

    test('it should call onSubmit action with selected divisions', async function (assert) {
      // given
      const noop = sinon.stub();
      const onSubmit = sinon.stub();

      const divisions = [{ label: 'division1', value: 'division1' }];

      // when
      const screen = await render(
        <template>
          <Attestations
            @divisions={{divisions}}
            @onSubmit={{onSubmit}}
            @onFilter={{noop}}
            @availableAttestations={{availableAttestations}}
          />
        </template>,
      );

      const multiSelect = await screen.getByRole('button', { name: t('pages.attestations.select-divisions-label') });
      await click(multiSelect);

      const firstDivisionOption = await screen.findByRole('checkbox', { name: 'division1' });
      await click(firstDivisionOption);

      const downloadButton = await screen.getByRole('button', {
        name: t('pages.attestations.download-attestations-button'),
      });

      await click(downloadButton);

      // then
      sinon.assert.calledWithExactly(onSubmit, SIXTH_GRADE_ATTESTATION_KEY, ['division1']);
      assert.ok(true);
    });
  });

  module('when organization does not managing student with SIXTH_GRADE attestation', function () {
    test('it should display all basics information', async function (assert) {
      // given
      const noop = sinon.stub();
      const divisions = undefined;

      // when

      const screen = await render(
        <template>
          <Attestations
            @divisions={{divisions}}
            @onSubmit={{noop}}
            @onFilter={{noop}}
            @availableAttestations={{availableAttestations}}
          />
        </template>,
      );
      // then
      assert.notOk(screen.queryByRole('button', { name: t('pages.attestations.select-divisions-label') }));
      assert.ok(screen.queryByRole('button', { name: t('pages.attestations.select-label') }));
      assert.ok(screen.getByRole('heading', { name: t('pages.attestations.title') }));
      assert.ok(screen.getByText(t('pages.attestations.basic-description')));
      assert.ok(screen.getByRole('button', { name: t('pages.attestations.download-attestations-button') }));
    });

    test('it should call onSubmit action with empty divisions', async function (assert) {
      // given
      const noop = sinon.stub();
      const onSubmit = sinon.stub();
      const currentAttestation = { label: '6ème', key: SIXTH_GRADE_ATTESTATION_KEY };

      const divisions = undefined;

      // when
      const screen = await render(
        <template>
          <Attestations
            @currentAttestation={{currentAttestation}}
            @divisions={{divisions}}
            @onSubmit={{onSubmit}}
            @onFilter={{noop}}
            @availableAttestations={{availableAttestations}}
          />
        </template>,
      );

      const downloadButton = await screen.getByRole('button', {
        name: t('pages.attestations.download-attestations-button'),
      });

      const select = await screen.getByLabelText(t('pages.attestations.select-label'));
      await click(select);

      const firstOption = await screen.findByRole('option', { name: '6ème' });
      await click(firstOption);

      await click(downloadButton);

      // then
      sinon.assert.calledWithExactly(onSubmit, SIXTH_GRADE_ATTESTATION_KEY, []);
      assert.ok(true);
    });
  });
});
