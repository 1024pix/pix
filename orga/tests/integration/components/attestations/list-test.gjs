import { render } from '@1024pix/ember-testing-library';
import AttestationList from 'pix-orga/components/attestations/list';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Attestations | List', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display division column and filter if at least one participant has division', async function (assert) {
    // given
    const triggerFiltering = sinon.stub();
    const divisionsOptions = ['6emeA'];
    const participantStatuses = [
      {
        lastName: 'jean',
        firstName: 'michel',
        division: '6emeA',
        obtainedAt: '2020-01-01',
      },
      {
        lastName: 'pierre',
        firstName: 'paul',
        division: null,
        obtainedAt: '2020-01-01',
      },
    ];

    // when
    const screen = await render(
      <template>
        <AttestationList
          @divisionsOptions={{divisionsOptions}}
          @participantStatuses={{participantStatuses}}
          @onFilter={{triggerFiltering}}
        />
      </template>,
    );

    // then
    assert.ok(screen.getByRole('button', { name: t('pages.attestations.table.filter.divisions.label') }));
    assert.ok(screen.getByRole('columnheader', { name: t('pages.attestations.table.column.division') }));
  });

  test('it should not display division column and filter if participant does not have divisions', async function (assert) {
    // given
    const triggerFiltering = sinon.stub();
    const participantStatuses = [
      {
        lastName: 'jean',
        firstName: 'michel',
        division: null,
        obtainedAt: '2020-01-01',
      },
      {
        lastName: 'pierre',
        firstName: 'paul',
        division: null,
        obtainedAt: '2020-01-01',
      },
    ];

    // when
    const screen = await render(
      <template>
        <AttestationList @participantStatuses={{participantStatuses}} @onFilter={{triggerFiltering}} />
      </template>,
    );

    // then
    assert.notOk(screen.queryByRole('button', { name: t('pages.attestations.table.filter.divisions.label') }));
    assert.notOk(screen.queryByRole('columnheader', { name: t('pages.attestations.table.column.division') }));
  });
});
