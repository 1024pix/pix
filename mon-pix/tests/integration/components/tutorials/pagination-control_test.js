import { describe, it } from 'mocha';
import { expect } from 'chai';
import { find, render } from '@ember/test-helpers';
import { clickByLabel } from '../../../helpers/click-by-label';
import { fillInByLabel } from '../../../helpers/fill-in-by-label';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import sinon from 'sinon';
import Service from '@ember/service';

function getMetaForPage({ pageNumber, rowCount = 50 }) {
  const pageSize = 25;
  return {
    page: pageNumber,
    pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pageSize),
  };
}

describe('Integration | Component | Tutorials | Pagination-Control', function () {
  setupIntlRenderingTest();
  let replaceWithStub;

  beforeEach(function () {
    replaceWithStub = sinon.stub();
    class RouterServiceStub extends Service {
      replaceWith = replaceWithStub;
    }
    this.owner.register('service:router', RouterServiceStub);
  });

  it('should display correct pagination', async function () {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 1 }));

    // when
    await render(hbs`<Tutorials::PaginationControl @pagination={{meta}}/>`);

    // then
    expect(find('.page-navigation')).to.have.property('textContent').that.contains('Page 1 / 2');
  });

  it('should disable previous button when user is on first page', async function () {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 1 }));

    // when
    await render(hbs`<Tutorials::PaginationControl @pagination={{meta}}/>`);

    // then
    expect(find('[aria-label="Aller à la page précédente"]')).to.have.attribute('disabled');
  });

  it('should disable next button when user is on last page', async function () {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 2 }));

    // when
    await render(hbs`<Tutorials::PaginationControl @pagination={{meta}}/>`);

    // then
    expect(find('[aria-label="Aller à la page suivante"]')).to.have.attribute('disabled');
  });

  it('should enable next button when user is on first page', async function () {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 1 }));

    // when
    await render(hbs`<Tutorials::PaginationControl @pagination={{meta}}/>`);

    // then
    expect(find('[aria-label="Aller à la page suivante"]')).not.to.have.attribute('disabled');
  });

  it('should enable previous button when user is on second page', async function () {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 2 }));

    // when
    await render(hbs`<Tutorials::PaginationControl @pagination={{meta}}/>`);
    // then
    expect(find('[aria-label="Aller à la page précédente"]')).not.to.have.attribute('disabled');
  });

  it('should re-route to next page when clicking on next page button', async function () {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 1 }));
    await render(hbs`<Tutorials::PaginationControl @pagination={{meta}}/>`);

    // when

    await clickByLabel('Aller à la page suivante');

    // then
    sinon.assert.calledWith(replaceWithStub, { queryParams: { pageNumber: 2 } });
  });

  it('should re-route to page with changed page size', async function () {
    // given
    this.set('meta', getMetaForPage({ pageNumber: 2 }));
    await render(hbs`<Tutorials::PaginationControl @pagination={{meta}}/>`);

    // when
    await fillInByLabel("Nombre d'éléments à afficher par page", '10');

    // then
    sinon.assert.calledWith(replaceWithStub, { queryParams: { pageSize: '10', pageNumber: 1 } });
  });

  describe('Display start and end items index of the page', function () {
    it('it should display start and end index of the first page (full)', async function () {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 1, rowCount: 50 }));

      // when
      await render(hbs`<Tutorials::PaginationControl @pagination={{meta}}/>`);

      // then
      expect(find('.page-navigation')).to.have.property('textContent').that.contains('1-25 sur 50 éléments');
    });

    it('should display only result counts when page count is 1', async function () {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 1, rowCount: 20 }));

      // when
      await render(hbs`<Tutorials::PaginationControl @pagination={{meta}}/>`);

      // then
      expect(find('.page-navigation')).to.have.property('textContent').that.contains('20 éléments');
    });

    it('should display start and end index of a middle page', async function () {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 2, rowCount: 70 }));

      // when
      await render(hbs`<Tutorials::PaginationControl @pagination={{meta}}/>`);

      // then
      expect(find('.page-navigation')).to.have.property('textContent').that.contains('26-50 sur 70 éléments');
    });

    it('should display start and end index of the last page (full)', async function () {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 2, rowCount: 50 }));

      // when
      await render(hbs`<Tutorials::PaginationControl @pagination={{meta}}/>`);

      // then
      expect(find('.page-navigation')).to.have.property('textContent').that.contains('26-50 sur 50 éléments');
    });

    it('should display start and end index of a full page (partial)', async function () {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 2, rowCount: 45 }));

      // when
      await render(hbs`<Tutorials::PaginationControl @pagination={{meta}}/>`);

      // then
      expect(find('.page-navigation')).to.have.property('textContent').that.contains('26-45 sur 45 éléments');
    });
  });

  describe('when no results', function () {
    it('should not display start and end index', async function () {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 1, rowCount: 0 }));

      // when
      await render(hbs`<Tutorials::PaginationControl @pagination={{meta}}/>`);

      // then
      expect(find('.page-navigation')).to.have.property('textContent').that.include('0 élément');
    });

    it('should disable previous button and next button', async function () {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 1, rowCount: 0 }));

      // when
      await render(hbs`<Tutorials::PaginationControl @pagination={{meta}}/>`);

      // then
      expect(find('[aria-label="Aller à la page précédente"]')).to.have.attribute('disabled');
      expect(find('[aria-label="Aller à la page suivante"]')).to.have.attribute('disabled');
    });

    it('should display default pagination', async function () {
      // given
      this.set('meta', getMetaForPage({ pageNumber: 1, rowCount: 0 }));

      // when
      await render(hbs`<Tutorials::PaginationControl @pagination={{meta}}/>`);

      // then
      expect(find('.page-navigation')).to.have.property('textContent').that.contains('Page 1 / 1');
    });
  });
});
