import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import ListSummaryItems from 'pix-admin/components/trainings/list-summary-items';
import { module, test } from 'qunit';

module('Integration | Component | routes/authenticated/trainings | list-items', function (hooks) {
  setupRenderingTest(hooks);

  const noop = () => {};

  test('it should display header with id and title', async function (assert) {
    // when
    const screen = await render(<template><ListSummaryItems @triggerFiltering={{noop}} /></template>);

    // then
    assert.dom(screen.getByText('ID')).exists();
    assert.dom(screen.getByText('Titre')).exists();
  });

  test('it should display trainings summaries list', async function (assert) {
    // given
    const summaries = [
      { id: 1, title: "Apprendre en s'amusant" },
      { id: 2, title: 'Speed training' },
    ];
    summaries.meta = {
      pagination: { rowCount: 2 },
    };

    // when
    const screen = await render(
      <template><ListSummaryItems @summaries={{summaries}} @triggerFiltering={{noop}} /></template>,
    );

    // then
    assert.strictEqual(screen.getAllByLabelText('Contenu formatif').length, 2);
  });

  test('it should display trainings summaries data', async function (assert) {
    // given
    const summaries = [{ id: 123, title: 'Comment toiletter son chien' }];
    summaries.meta = {
      pagination: { rowCount: 2 },
    };

    // when
    const screen = await render(
      <template><ListSummaryItems @summaries={{summaries}} @triggerFiltering={{noop}} /></template>,
    );

    // then
    assert.dom(screen.getByLabelText('Contenu formatif')).containsText(123);
    assert.dom(screen.getByLabelText('Contenu formatif')).containsText('Comment toiletter son chien');
  });
});
