import { clickByName, render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

function getMetaForPage({ pageNumber, rowCount = 50 }) {
  const pageSize = 25;
  return {
    page: pageNumber,
    pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pageSize),
  };
}

module('Integration | Component | Table::PaginationControl', function (hooks) {
  setupIntlRenderingTest(hooks);
  let routerService;

  hooks.beforeEach(function () {
    routerService = this.owner.lookup('service:router');

    sinon.stub(routerService, 'replaceWith');
  });

  test('it should display correct pagination', async function (assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 1 }));

    // when
    const screen = await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

    // then
    assert.ok(screen.getByText(this.intl.t('common.pagination.page-number', { current: 1, total: 2 })));
  });

  test('it should disable previous button when user is on first page', async function (assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 1 }));

    // when
    const screen = await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

    // then
    assert.ok(
      screen.getByRole('button', { name: this.intl.t('common.pagination.action.previous') }).hasAttribute('disabled'),
    );
  });

  test('it should disable next button when user is on last page', async function (assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 2 }));

    // when
    const screen = await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

    // then
    assert.ok(
      screen.getByRole('button', { name: this.intl.t('common.pagination.action.next') }).hasAttribute('disabled'),
    );
  });

  test('it should enable next button when user is on first page', async function (assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 1 }));

    // when
    const screen = await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

    // then
    assert.notOk(
      screen.getByRole('button', { name: this.intl.t('common.pagination.action.next') }).hasAttribute('disabled'),
    );
  });

  test('it should enable previous button when user is on second page', async function (assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 2 }));

    // when
    const screen = await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

    // then
    assert.notOk(
      screen.getByRole('button', { name: this.intl.t('common.pagination.action.previous') }).hasAttribute('disabled'),
    );
  });

  test('it should re-route to next page when clicking on next page button', async function (assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 1 }));
    await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

    // when
    await clickByName(this.intl.t('common.pagination.action.next'));

    // then
    assert.ok(routerService.replaceWith.calledWith({ queryParams: { pageNumber: 2 } }));
  });

  test('it should re-route to previous page when clicking on previous page button', async function (assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 2 }));
    await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

    // when
    await clickByName(this.intl.t('common.pagination.action.previous'));

    // then
    assert.ok(routerService.replaceWith.calledWith({ queryParams: { pageNumber: 1 } }));
  });

  test('it should re-route to page with changed page size', async function (assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 2 }));
    const screen = await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

    // when
    await click(screen.getByLabelText(this.intl.t('common.pagination.action.select-page-size')));
    await click(await screen.findByRole('option', { name: '10' }));

    // then
    assert.ok(routerService.replaceWith.calledWith({ queryParams: { pageSize: 10, pageNumber: 1 } }));
  });

  module('Display start and end items index of the page', () => {
    test('it should display start and end index of the first page (full)', async function (assert) {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 1, rowCount: 50 }));

      // when
      const screen = await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

      // then
      assert.ok(screen.getByText(this.intl.t('common.pagination.page-info', { start: 1, end: 25, total: 50 })));
    });

    test('it should display only result counts when page count is 1', async function (assert) {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 1, rowCount: 20 }));

      // when
      const screen = await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

      // then
      assert.ok(screen.getByText(this.intl.t('common.pagination.page-results', { total: 20 })));
    });

    test('it should display start and end index of a middle page', async function (assert) {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 2, rowCount: 70 }));

      // when
      const screen = await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

      // then
      assert.ok(screen.getByText(this.intl.t('common.pagination.page-info', { start: 26, end: 50, total: 70 })));
    });

    test('it should display start and end index of the last page (full)', async function (assert) {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 2, rowCount: 50 }));

      // when
      const screen = await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

      // then
      assert.ok(screen.getByText(this.intl.t('common.pagination.page-info', { start: 26, end: 50, total: 50 })));
    });

    test('it should display start and end index of a full page (partial)', async function (assert) {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 2, rowCount: 45 }));

      // when
      const screen = await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

      // then
      assert.ok(screen.getByText(this.intl.t('common.pagination.page-info', { start: 26, end: 45, total: 45 })));
    });
  });

  module('When no results', function () {
    test('it should not display start and end index ', async function (assert) {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 1, rowCount: 0 }));

      // when
      const screen = await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

      // then
      assert.ok(screen.getByText(this.intl.t('common.pagination.page-results', { total: 0 })));
    });

    test('it should disable previous button and next button', async function (assert) {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 1, rowCount: 0 }));

      // when
      const screen = await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

      // then
      assert.ok(
        screen.getByRole('button', { name: this.intl.t('common.pagination.action.previous') }).hasAttribute('disabled'),
      );
      assert.ok(
        screen.getByRole('button', { name: this.intl.t('common.pagination.action.next') }).hasAttribute('disabled'),
      );
    });

    test('it should display default pagination', async function (assert) {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 1, rowCount: 0 }));

      // when
      const screen = await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

      // then
      assert.ok(screen.getByText(this.intl.t('common.pagination.page-number', { current: 1, total: 1 })));
    });
  });
});
