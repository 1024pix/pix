import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/sessions | list-items', function(hooks) {

  setupRenderingTest(hooks);

  test('it should display sessions list', async function(assert) {
    // given
    const now = new Date();
    const displayDate = now.toLocaleString('fr-FR', { day: 'numeric', month: 'numeric', year: 'numeric' });
    const displayStatus = 'SomeStatus';
    const sessions = [
      { id: 1, certificationCenterName: 'Centre A', certificationCenter: { type: 'SUP' },
        date: now, time: '14:00:00', displayDate,
        displayStatus, countPublishedCertifications: 0, displayFinalizationDate: '', displayPublishedAtDate: '',
        displayResultsSentToPrescriberDate: '',
      },
      { id: 2, certificationCenterName: 'Centre B', certificationCenter: { type: null },
        date: now, time: '14:00:00', displayDate,
        displayStatus, countPublishedCertifications: 1, displayFinalizationDate: 'SomeFDate', displayPublishedAtDate: 'SomePDate',
        displayResultsSentToPrescriberDate: 'SomeRDate',
      },
      { id: 3, certificationCenterName: 'Centre C',
        date: now, time: '14:00:00', displayDate,
        displayStatus, countPublishedCertifications: 1, displayFinalizationDate: 'SomeFDate', displayPublishedAtDate: 'SomePDate',
        displayResultsSentToPrescriberDate: 'SomeRDate',
      },
    ];

    sessions.meta = { rowCount: 3 };
    const triggerFiltering = function() {};

    this.set('sessions', sessions);
    this.set('triggerFiltering', triggerFiltering);

    // when
    await render(hbs`{{sessions/list-items sessions=sessions triggerFiltering=triggerFiltering}}`);

    // then
    assert.dom('table tbody tr').exists({ count: sessions.length });
    for (let i = 0; i < sessions.length; ++i) {
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:first-child`).hasText(sessions[i].id.toString());
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(2)`).hasText(sessions[i].certificationCenterName);
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(4)`).hasText(displayDate + ' à ' + sessions[i].time);
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(5)`).hasText(sessions[i].displayStatus);
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(6)`).hasText(sessions[i].displayFinalizationDate);
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(7)`).hasText(sessions[i].countPublishedCertifications.toString());
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(8)`).hasText(sessions[i].displayPublishedAtDate);
      assert.dom(`table tbody tr:nth-child(${i + 1}) td:nth-child(9)`).hasText(sessions[i].displayResultsSentToPrescriberDate);
    }
    assert.dom('table tbody tr:nth-child(1) td:nth-child(3)').hasText(sessions[0].certificationCenter.type);
    assert.dom('table tbody tr:nth-child(2) td:nth-child(3)').hasText('-');
    assert.dom('table tbody tr:nth-child(3) td:nth-child(3)').hasText('-');
  });
});
