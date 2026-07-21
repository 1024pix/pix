import { render } from '@1024pix/ember-testing-library';
import ListItems from 'pix-admin/components/sessions/list-items';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/authenticated/sessions | list-items', function (hooks) {
  setupIntlRenderingTest(hooks);

  const triggerFiltering = () => {};

  test('it should display sessions list', async function (assert) {
    // given
    const date = new Date();
    const finalizedAt = new Date('2020-08-14T00:00:00Z');
    const publishedAt = new Date('2020-06-14T00:00:00Z');
    const resultsSentToPrescriberAt = new Date('2020-08-15T00:00:00Z');
    const displayStatus = 'SomeStatus';
    const sessions = [
      {
        id: 1,
        certificationCenterName: 'Centre A',
        certificationCenterExternalId: 'EXTIDA',
        certificationCenterType: 'SUP',
        date,
        time: '14:00:00',
        displayStatus,
        finalizedAt: '',
        publishedAt: '',
        resultsSentToPrescriberAt: '',
      },
      {
        id: 2,
        certificationCenterName: 'Centre B',
        certificationCenterExternalId: 'EXTIDB',
        certificationCenterType: null,
        date,
        time: '14:00:00',
        displayStatus,
        finalizedAt,
        publishedAt,
        resultsSentToPrescriberAt,
      },
    ];
    const displayedDate = date.toLocaleString('fr-FR', { day: 'numeric', month: 'numeric', year: 'numeric' });
    const displayedFinalizedAt = finalizedAt.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const displayedPublishedAt = publishedAt.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });

    sessions.meta = { rowCount: 2 };

    // when
    await render(<template><ListItems @sessions={{sessions}} @triggerFiltering={{triggerFiltering}} /></template>);

    // then
    assert.dom('table tbody tr').exists({ count: sessions.length });
    for (let i = 0; i < sessions.length; ++i) {
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:first-child`).hasText(sessions[i].id.toString());
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(2)`).hasText(sessions[i].certificationCenterName);
      assert
        .dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(5)`)
        .hasText(displayedDate + ' à ' + sessions[i].time);
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(6)`).hasText(sessions[i].displayStatus);
      assert
        .dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(7)`)
        .hasText(sessions[i].finalizedAt ? displayedFinalizedAt : sessions[i].finalizedAt);
      assert
        .dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(8)`)
        .hasText(sessions[i].publishedAt ? displayedPublishedAt : sessions[i].publishedAt);
    }
    // Colonne : Centre de certification
    assert.dom('table tbody tr:nth-child(1) td:nth-child(3)').hasText(sessions[0].certificationCenterExternalId);
    assert.dom('table tbody tr:nth-child(1) td:nth-child(4)').hasText(sessions[0].certificationCenterType);
    assert.dom('table tbody tr:nth-child(2) td:nth-child(4)').hasText('-');
  });
});
