import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

function getMetaForPage(pageNumber) {
  const rowCount = 50;
  const pageSize = 25;
  return {
    page: pageNumber,
    pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pageSize),
  };
}

module('Integration | Component | pagination-control', function(hooks) {
  setupRenderingTest(hooks);

  test('it should disable previous button when user is on first page', async function(assert) {
    // given
    this.set('meta', getMetaForPage(1));

    // when
    await render(hbs`{{pagination-control pagination=meta}}`);

    // then
    assert.dom('.page-navigation__arrow--previous').hasClass('page-navigation__arrow--disabled');
    assert.dom('.page-navigation__arrow--previous .icon-button').hasClass('disabled');
  });

  test('it should disable next button when user is on last page', async function(assert) {
    // given
    this.set('meta', getMetaForPage(2));

    // when
    await render(hbs`{{pagination-control pagination=meta}}`);

    // then
    assert.dom('.page-navigation__arrow--next').hasClass('page-navigation__arrow--disabled');
    assert.dom('.page-navigation__arrow--next .icon-button').hasClass('disabled');
  });

  test('it should enable previous button when user is on second page', async function(assert) {
    // given
    this.set('meta', getMetaForPage(2));

    // when
    await render(hbs`{{pagination-control pagination=meta}}`);

    // then
    assert.dom('.page-navigation__arrow--previous').hasNoClass('page-navigation__arrow--disabled');
    assert.dom('.page-navigation__arrow--previous .icon-button').hasNoClass('disabled');
  });

});
