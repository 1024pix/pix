import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Charts::ParticipantsByStage', function (hooks) {
  setupIntlRenderingTest(hooks);
  const campaignId = 1;
  let onSelectStage, dataFetcher, screen;

  hooks.beforeEach(async function () {
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
    screen = await render(
      hbs`<Campaign::Charts::ParticipantsByStage @campaignId={{this.campaignId}} @onSelectStage={{this.onSelectStage}} />`,
    );
  });

  test('it should display stage stars', async function (assert) {
    const [starNotAcquired, starAcquired] = document.querySelectorAll('.pix-stars__item');

    assert.dom(starNotAcquired).doesNotHaveAttribute('data-acquired');
    assert.dom(starAcquired).hasAttribute('data-acquired');
  });

  test('it should display participants number', async function (assert) {
    // then
    assert.ok(screen.getByText('0 participant'));
    assert.ok(screen.getByText('5 participants'));
  });

  test('it should display participants percentage by stages', async function (assert) {
    // then
    assert.ok(screen.getByText('0 %'));
    assert.ok(screen.getByText('100 %'));
  });

  test('should render a screen reader message', async function (assert) {
    // then
    assert.ok(screen.getByText('0 étoile sur 1'));
    assert.ok(screen.getByText('1 étoile sur 1'));
  });

  test('it should not display empty tooltip', async function (assert) {
    // then
    assert.notOk(screen.queryByRole('tooltip'));
  });

  test('it should call onSelectStage when user click on a bar', async function (assert) {
    // when

    // click on the first stage bar
    await click(screen.getAllByRole('button')[0]);

    // then
    sinon.assert.calledWith(onSelectStage, 100498);
    assert.ok(true);
  });

  module('when there is tooltip info', function () {
    module('when there is title and description', function () {
      test('it should contains tooltip info', async function (assert) {
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
        const screen = await render(
          hbs`<Campaign::Charts::ParticipantsByStage @campaignId={{this.campaignId}} @onSelectStage={{this.onSelectStage}} />`,
        );

        // then
        assert.ok(screen.getByText('title1'));
        assert.ok(screen.getByText('description1'));

        assert.ok(screen.getByText('title2'));
        assert.ok(screen.getByText('description2'));
      });
    });

    module('when there is only title', function () {
      test('tooltip should contains title', async function (assert) {
        // given
        dataFetcher.withArgs(campaignId).resolves({
          data: {
            attributes: {
              data: [{ id: 100498, value: 0, title: 'title1' }],
            },
          },
        });

        // when
        const screen = await render(
          hbs`<Campaign::Charts::ParticipantsByStage @campaignId={{this.campaignId}} @onSelectStage={{this.onSelectStage}} />`,
        );

        // then
        assert.dom('[role="tooltip"]').exists();
        assert.ok(screen.getByText('title1'));
      });
    });

    module('when there is only description', function () {
      test('tooltip should contains description', async function (assert) {
        // given
        dataFetcher.withArgs(campaignId).resolves({
          data: {
            attributes: {
              data: [{ id: 100498, value: 0, description: 'description1' }],
            },
          },
        });

        // when
        await render(
          hbs`<Campaign::Charts::ParticipantsByStage @campaignId={{this.campaignId}} @onSelectStage={{this.onSelectStage}} />`,
        );

        // then
        assert.dom('[role="tooltip"]').exists();
        assert.ok(screen.getByText('description1'));
      });
    });
  });
});
