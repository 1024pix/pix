import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | TargetProfiles::ListSummaryItems', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.triggerFiltering = () => {};
  });

  test('it should display target profile summary', async function (assert) {
    // given
    const summary = {
      id: 123,
      name: 'Profile Cible',
      oudated: false,
      isDisabled: true,
      createdAt: new Date('2021-01-01'),
    };
    const summaries = [summary];
    summaries.meta = { page: 1, pageSize: 1 };
    this.summaries = summaries;
    this.id = undefined;
    this.name = undefined;

    // when
    const screen = await render(
      hbs`<TargetProfiles::ListSummaryItems
      @id={{this.id}}
      @summaries={{this.summaries}}
      @name={{this.name}}
  @triggerFiltering={{this.triggerFiltering}}
/>`,
    );

    // then
    assert.dom(screen.getByText('123')).exists();
    assert.dom(screen.getByText('Profile Cible')).exists();
    assert.dom(screen.getByText('Actif')).exists();
    assert.dom(screen.getByText('01/01/2021')).exists();
    assert.dom(screen.getByText('Actif')).exists();
  });
});
