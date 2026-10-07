import { render } from '@1024pix/ember-testing-library';
import Timeline from 'pix-admin/components/candidates/timeline';
import { module, test } from 'qunit';

import setupIntlRenderingTest, { t } from '../../helpers/setup-intl-rendering';

module('Integration | Component | Candidates | Timeline', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;
  let intl;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    intl = this.owner.lookup('service:intl');
  });

  test('it should display events', async function (assert) {
    // given
    const timeline = store.createRecord('certification-candidate-timeline', {
      events: [{ code: 'ComplementaryCertifiableEvent', when: new Date(), metadata: { x: 'y' } }],
    });
    const formattedDate = intl.formatDate(timeline.events[0].when, { format: 'long' });

    // when
    const screen = await render(<template><Timeline @timeline={{timeline}} /></template>);

    // then
    assert.dom(screen.getByRole('cell', { name: t('pages.candidate.events.ComplementaryCertifiableEvent') })).exists();
    assert.dom(screen.getByRole('cell', { name: formattedDate })).exists();
    assert.dom(screen.getByRole('cell', { name: /"x": "y"/ })).exists();
  });

  test('it should display a dash when event metadata is empty', async function (assert) {
    // given
    const timeline = store.createRecord('certification-candidate-timeline', {
      events: [{ code: 'ComplementaryCertifiableEvent', when: new Date(), metadata: {} }],
    });

    // when
    const screen = await render(<template><Timeline @timeline={{timeline}} /></template>);

    // then
    assert.dom(screen.getByRole('cell', { name: '-' })).exists();
  });
});
