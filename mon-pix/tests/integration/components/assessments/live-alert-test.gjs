import { clickByName, render } from '@1024pix/ember-testing-library';
import LiveAlert from 'mon-pix/components/assessments/live-alert';
import Location from 'mon-pix/utils/location';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Assessments | live-alert', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays challenge live alert', async function (assert) {
    // given

    // when
    const screen = await render(<template><LiveAlert /></template>);

    // then
    assert.dom(screen.getByRole('button', { name: 'Rafraîchir la page' })).exists();
  });

  test('it refreshes the page when clicking the refresh button', async function (assert) {
    // given
    const reloadStub = sinon.stub(Location, 'reload');
    await render(<template><LiveAlert /></template>);

    // when
    await clickByName('Rafraîchir la page');

    // then
    sinon.assert.calledOnce(reloadStub);
    assert.ok(true);
  });
});
