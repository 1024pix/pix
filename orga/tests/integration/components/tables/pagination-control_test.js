import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import Service from '@ember/service';
import { render, clickByName } from '@1024pix/ember-testing-library';

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
  let replaceWithStub;

  hooks.beforeEach(function () {
    replaceWithStub = sinon.stub();
    class RouterStub extends Service {
      replaceWith = replaceWithStub;
    }
    this.owner.register('service:router', RouterStub);
  });

  test('it should display correct pagination', async function (assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 1 }));

    // when
    await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

    // then
    assert.contains('Page 1 / 2');
  });

  test('it should disable previous button when user is on first page', async function (assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 1 }));

    // when
    await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

    // then
    assert.dom('[aria-label="Aller à la page précédente"]').hasAttribute('disabled');
  });

  test('it should disable next button when user is on last page', async function (assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 2 }));

    // when
    await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

    // then
    assert.dom('[aria-label="Aller à la page suivante"]').hasAttribute('disabled');
  });

  test('it should enable next button when user is on first page', async function (assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 1 }));

    // when
    await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

    // then
    assert.dom('[aria-label="Aller à la page suivante"]').hasNoAttribute('disabled');
  });

  test('it should enable previous button when user is on second page', async function (assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 2 }));

    // when
    await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

    // then
    assert.dom('[aria-label="Aller à la page précédente"]').hasNoAttribute('disabled');
  });

  test('it should re-route to next page when clicking on next page button', async function (assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 1 }));
    await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

    // when
    await clickByName('Aller à la page suivante');

    // then
    assert.ok(replaceWithStub.calledWith({ queryParams: { pageNumber: 2 } }));
  });

  test('it should re-route to previous page when clicking on previous page button', async function (assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 2 }));
    await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

    // when
    await clickByName('Aller à la page précédente');

    // then
    assert.ok(replaceWithStub.calledWith({ queryParams: { pageNumber: 1 } }));
  });

  test('it should re-route to page with changed page size', async function (assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 2 }));
    const screen = await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

    // when
    await click(screen.getByLabelText("Nombre d'élément à afficher par page"));
    await click(await screen.findByRole('option', { name: '10' }));

    // then
    assert.ok(replaceWithStub.calledWith({ queryParams: { pageSize: 10, pageNumber: 1 } }));
  });

  module('Display start and end items index of the page', () => {
    test('it should display start and end index of the first page (full)', async function (assert) {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 1, rowCount: 50 }));

      // when
      await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

      // then
      assert.contains('1-25 sur 50 éléments');
    });

    test('it should display only result counts when page count is 1', async function (assert) {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 1, rowCount: 20 }));

      // when
      await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

      // then
      assert.contains('20 éléments');
    });

    test('it should display start and end index of a middle page', async function (assert) {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 2, rowCount: 70 }));

      // when
      await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

      // then
      assert.contains('26-50 sur 70 éléments');
    });

    test('it should display start and end index of the last page (full)', async function (assert) {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 2, rowCount: 50 }));

      // when
      await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

      // then
      assert.contains('26-50 sur 50 éléments');
    });

    test('it should display start and end index of a full page (partial)', async function (assert) {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 2, rowCount: 45 }));

      // when
      await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

      // then
      assert.contains('26-45 sur 45 éléments');
    });
  });

  module('When no results', function () {
    test('it should not display start and end index ', async function (assert) {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 1, rowCount: 0 }));

      // when
      await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

      // then
      assert.contains('0 élément');
    });

    test('it should disable previous button and next button', async function (assert) {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 1, rowCount: 0 }));

      // when
      await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

      // then
      assert.dom('[aria-label="Aller à la page précédente"]').hasAttribute('disabled');
      assert.dom('[aria-label="Aller à la page suivante"]').hasAttribute('disabled');
    });

    test('it should display default pagination', async function (assert) {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 1, rowCount: 0 }));

      // when
      await render(hbs`<Table::PaginationControl @pagination={{this.meta}} />`);

      // then
      assert.contains('Page 1 / 1');
    });
  });
});
