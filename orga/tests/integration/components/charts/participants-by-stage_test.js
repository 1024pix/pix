import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import sinon from 'sinon';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Charts::ParticipantsByStage', function(hooks) {
  setupIntlRenderingTest(hooks);
  const campaignId = 1;
  let onSelectStage, dataFetcher;

  hooks.beforeEach(async function() {
    // given
    onSelectStage = sinon.stub();
    this.set('onSelectStage', onSelectStage);
    this.set('campaignId', campaignId);

    const store = this.owner.lookup('service:store');
    const adapter = store.adapterFor('campaign-stats');
    dataFetcher = sinon.stub(adapter, 'getParticipationsByStage');

    dataFetcher.withArgs(campaignId).resolves({
      data: {
        attributes: {
          data: [
            { id: 100498, value: 0 },
            { id: 100499, value: 5 },
          ],
        },
      },
    });

    // when
    await render(hbs`<Charts::ParticipantsByStage @campaignId={{campaignId}} @onSelectStage={{onSelectStage}} />`);
  });

  test('it should display stage stars', async function(assert) {
    assert.dom('[data-test-status=acquired]').isVisible({ count: 1 });
    assert.dom('[data-test-status=unacquired]').isVisible({ count: 1 });
  });

  test('it should display participants number', async function(assert) {
    // then
    assert.contains('0 participant');
    assert.contains('5 participants');
  });

  test('it should display participants percentage by stages', async function(assert) {
    // then
    assert.contains('0 %');
    assert.contains('100 %');
  });

  test('it should not display empty tooltip', async function(assert) {
    // then
    assert.dom('[role="tooltip"]').doesNotExist();
  });

  test('it should call onSelectStage when user click on a bar', async function(assert) {
    // when
    await click('[role=button]');
    // then
    assert.dom('[role=button]').exists();
    sinon.assert.calledWith(onSelectStage, 100498);
  });

  module('when there is tooltip info', function() {
    module('when there is title and description', function() {
      test('it should contains tooltip info', async function(assert) {
        // given
        dataFetcher.withArgs(campaignId).resolves({
          data: {
            attributes: {
              data: [
                { id: 100498, value: 0, title: 'title1', description: 'description1' },
                { id: 100499, value: 5, title: 'title2', description: 'description2' },
              ],
            },
          },
        });

        // when
        await render(hbs`<Charts::ParticipantsByStage @campaignId={{campaignId}} @onSelectStage={{onSelectStage}} />`);

        // then
        assert.dom('[role="tooltip"]').exists();
        assert.contains('title1');
        assert.contains('description1');
        assert.contains('title2');
        assert.contains('description2');
      });
    });

    module('when there is only title', function() {
      test('tooltip should contains title', async function(assert) {
        // given
        dataFetcher.withArgs(campaignId).resolves({
          data: {
            attributes: {
              data: [
                { id: 100498, value: 0, title: 'title1' },
              ],
            },
          },
        });

        // when
        await render(hbs`<Charts::ParticipantsByStage @campaignId={{campaignId}} @onSelectStage={{onSelectStage}} />`);

        // then
        assert.dom('[role="tooltip"]').exists();
        assert.contains('title1');
      });
    });

    module('when there is only description', function() {
      test('tooltip should contains description', async function(assert) {
        // given
        dataFetcher.withArgs(campaignId).resolves({
          data: {
            attributes: {
              data: [
                { id: 100498, value: 0, description: 'description1' },
              ],
            },
          },
        });

        // when
        await render(hbs`<Charts::ParticipantsByStage @campaignId={{campaignId}} @onSelectStage={{onSelectStage}} />`);

        // then
        assert.dom('[role="tooltip"]').exists();
        assert.contains('description1');
      });
    });
  });
});
