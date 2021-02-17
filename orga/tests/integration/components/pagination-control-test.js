import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import Service from '@ember/service';
import clickByLabel from '../../helpers/extended-ember-test-helpers/click-by-label';
import fillInByLabel from '../../helpers/extended-ember-test-helpers/fill-in-by-label';

function getMetaForPage({ pageNumber, rowCount = 50 }) {
  const pageSize = 25;
  return {
    page: pageNumber,
    pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pageSize),
  };
}

module('Integration | Component | pagination-control', function(hooks) {
  setupIntlRenderingTest(hooks);
  let replaceWithStub;

  hooks.beforeEach(function() {
    replaceWithStub = sinon.stub();
    class RouterStub extends Service {
      replaceWith = replaceWithStub;
    }
    this.owner.register('service:router', RouterStub);
  });

  test('it should display correct pagination', async function(assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 1 }));

    // when
    await render(hbs`<PaginationControl @pagination={{meta}}/>`);

    // then
    assert.contains('Page 1 / 2');
  });

  test('it should disable previous button when user is on first page', async function(assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 1 }));

    // when
    await render(hbs`<PaginationControl @pagination={{meta}}/>`);

    // then
    assert.dom('[aria-label="Aller à la page précédente"]').hasAttribute('disabled');
  });

  test('it should disable next button when user is on last page', async function(assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 2 }));

    // when
    await render(hbs`<PaginationControl @pagination={{meta}}/>`);

    // then
    assert.dom('[aria-label="Aller à la page suivante"]').hasAttribute('disabled');
  });

  test('it should enable next button when user is on first page', async function(assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 1 }));

    // when
    await render(hbs`<PaginationControl @pagination={{meta}}/>`);

    // then
    assert.dom('[aria-label="Aller à la page suivante"]').hasNoAttribute('disabled');
  });

  test('it should enable previous button when user is on second page', async function(assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 2 }));

    // when
    await render(hbs`<PaginationControl @pagination={{meta}}/>`);

    // then
    assert.dom('[aria-label="Aller à la page précédente"]').hasNoAttribute('disabled');
  });

  test('it should re-route to next page when clicking on next page button', async function(assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 1 }));
    await render(hbs`<PaginationControl @pagination={{meta}}/>`);

    // when
    await clickByLabel('Aller à la page suivante');

    // then
    assert.ok(replaceWithStub.calledWith({ queryParams: { pageNumber: 2 } }));
  });

  test('it should re-route to previous page when clicking on previous page button', async function(assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 2 }));
    await render(hbs`<PaginationControl @pagination={{meta}}/>`);

    // when
    await clickByLabel('Aller à la page précédente');

    // then
    assert.ok(replaceWithStub.calledWith({ queryParams: { pageNumber: 1 } }));
  });

  test('it should re-route to page with changed page size', async function(assert) {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 2 }));
    await render(hbs`<PaginationControl @pagination={{meta}}/>`);

    // when
    await fillInByLabel('Sélectionner une pagination', '10');

    // then
    assert.ok(replaceWithStub.calledWith({ queryParams: { pageSize: '10', pageNumber: 1 } }));
  });

  module('When no results', function() {
    test('it should disable previous button and next button', async function(assert) {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 1, rowCount: 0 }));

      // when
      await render(hbs`<PaginationControl @pagination={{meta}}/>`);

      // then
      assert.dom('[aria-label="Aller à la page précédente"]').hasAttribute('disabled');
      assert.dom('[aria-label="Aller à la page suivante"]').hasAttribute('disabled');
    });

    test('it should display default pagination', async function(assert) {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 1, rowCount: 0 }));

      // when
      await render(hbs`<PaginationControl @pagination={{meta}}/>`);

      // then
      assert.contains('Page 1 / 1');
    });
  });
});
