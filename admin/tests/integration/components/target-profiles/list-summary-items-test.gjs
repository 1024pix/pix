import { render, within } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ListSummaryItems from 'pix-admin/components/target-profiles/list-summary-items';
import { categories as CATEGORIES } from 'pix-admin/helpers/target-profile-categories.js';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | TargetProfiles::ListSummaryItems', function (hooks) {
  setupIntlRenderingTest(hooks);

  const triggerFiltering = () => {};

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
    const id = undefined;
    const name = undefined;

    // when
    const screen = await render(
      <template>
        <ListSummaryItems @id={{id}} @summaries={{summaries}} @name={{name}} @triggerFiltering={{triggerFiltering}} />
      </template>,
    );

    // then
    assert.dom(screen.getByText('123')).exists();
    assert.dom(screen.getByText('Profile Cible')).exists();
    assert.dom(screen.getByText('Actif')).exists();
    assert.dom(screen.getByText('01/01/2021')).exists();
    assert.dom(screen.getByText('Actif')).exists();
  });
  module('resetFilters', function () {
    test('it should be disabled if no filters is set', async function (assert) {
      // given
      const summaries = [];
      summaries.meta = { page: 1, pageSize: 1 };
      const id = undefined;
      const name = undefined;
      const categories = [];

      // when
      const screen = await render(
        <template>
          <ListSummaryItems
            @id={{id}}
            @summaries={{summaries}}
            @name={{name}}
            @categories={{categories}}
            @triggerFiltering={{triggerFiltering}}
          />
        </template>,
      );

      // then
      const button = screen.getByRole('button', { name: t('common.filters.actions.clear'), hidden: true });

      assert.true(button.disabled);
    });
  });
  module('filter', function () {
    test('it should display categories filter', async function (assert) {
      // given
      const summaries = [];
      summaries.meta = { page: 1, pageSize: 1 };
      const id = undefined;
      const name = undefined;
      const categories = undefined;

      // when
      const screen = await render(
        <template>
          <ListSummaryItems
            @id={{id}}
            @summaries={{summaries}}
            @name={{name}}
            @categories={{categories}}
            @triggerFiltering={{triggerFiltering}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByLabelText(t('common.filters.target-profile.label')));
    });

    test('it should display selected categories', async function (assert) {
      // given
      const summaries = [];
      summaries.meta = { page: 1, pageSize: 1 };
      const id = undefined;
      const name = undefined;
      const categories = ['OTHER'];

      // when
      const screen = await render(
        <template>
          <ListSummaryItems
            @id={{id}}
            @summaries={{summaries}}
            @name={{name}}
            @categories={{categories}}
            @triggerFiltering={{triggerFiltering}}
          />
        </template>,
      );

      // then
      const domNode = screen.getByLabelText(t('common.filters.target-profile.label'));
      await domNode.click();
      const menu = await screen.findByRole('menu');
      const checkbox = within(menu).getByRole('checkbox', { name: t(CATEGORIES.OTHER) });
      assert.true(checkbox.checked);
    });

    test('it should call triggerFiltering', async function (assert) {
      // given
      const summaries = [];
      summaries.meta = { page: 1, pageSize: 1 };
      const id = undefined;
      const name = undefined;
      const categories = [];

      const triggerFilteringSpy = sinon.spy();

      // when
      const screen = await render(
        <template>
          <ListSummaryItems
            @id={{id}}
            @summaries={{summaries}}
            @name={{name}}
            @categories={{categories}}
            @triggerFiltering={{triggerFilteringSpy}}
          />
        </template>,
      );

      // then
      const domNode = screen.getByLabelText(t('common.filters.target-profile.label'));
      await domNode.click();
      const menu = await screen.findByRole('menu');
      const checkbox = within(menu).getByRole('checkbox', { name: t(CATEGORIES.OTHER) });
      await checkbox.click();
      assert.true(triggerFilteringSpy.calledWithExactly('categories', { target: { value: ['OTHER'] } }));
    });
  });
});
