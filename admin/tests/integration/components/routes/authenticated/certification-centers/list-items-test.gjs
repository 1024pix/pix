import { render } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import ListItems from 'pix-admin/components/certification-centers/list-items';
import { module, test } from 'qunit';

module('Integration | Component | routes/authenticated/certification-centers | list-items', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display certification-centers list', async function (assert) {
    // given
    const certificationCenters = [
      { id: 1, name: 'John', type: 'SCO', externalId: '123' },
      { id: 2, name: 'Jane', type: 'SUP', externalId: '456' },
      { id: 3, name: 'Lola', type: 'PRO', externalId: '789' },
    ];
    certificationCenters.meta = {
      rowCount: 3,
    };
    const triggerFiltering = function () {};

    // when
    await render(
      <template>
        <ListItems @certificationCenters={{certificationCenters}} @triggerFiltering={{triggerFiltering}} />
      </template>,
    );

    // then
    assert.dom('table tbody tr:first-child td:first-child').hasText('1');
    assert.dom('table tbody tr:first-child td:nth-child(2)').hasText('John');
    assert.dom('table tbody tr:first-child td:nth-child(3)').hasText('SCO');
    assert.dom('table tbody tr:first-child td:nth-child(4)').hasText('123');
    assert.dom('table tbody tr').exists({ count: 3 });
  });
});
