import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Activity::Dashboard', (hooks) => {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    const adapterStub = {
      getParticipationsByStatus: sinon
        .stub()
        .withArgs('1')
        .resolves({
          data: {
            attributes: {
              started: 1,
              shared: 3,
            },
          },
        }),
      getParticipationsByDay: sinon.stub().resolves({
        data: {
          attributes: {
            'started-participations': [],
            'shared-participations': [],
          },
        },
      }),
    };
    sinon.stub(store, 'adapterFor');
    store.adapterFor.withArgs('campaign-stats').returns(adapterStub);
  });

  test('it displays right data', async function (assert) {
    this.set('campaign', { id: '1' });

    const screen = await render(hbs`<Campaign::Activity::Dashboard @campaign={{this.campaign}} />`);

    assert.ok(screen.getByText('4'));
  });
});
