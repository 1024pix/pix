import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { click, find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import setupIntl from '../../helpers/setup-intl';

describe('Integration | Component | certifications list item', function() {
  setupRenderingTest();
  setupIntl();

  let certification;
  const PUBLISH_CLASS = '.certifications-list-item__published-item';
  const CERTIFICATION_CELL_SELECTOR = '.certifications-list-item__cell';
  const STATUS_SELECTOR = '.certifications-list-item__cell-double-width';
  const IMG_FOR_STATUS_SELECTOR = 'img.certifications-list-item__cross-img';
  const PIX_SCORE_CELL_SELECTOR = '.certifications-list-item__pix-score';
  const DETAIL_SELECTOR = '.certifications-list-item__cell-detail';
  const REJECTED_DETAIL_SELECTOR = `${DETAIL_SELECTOR} button`;
  const VALIDATED_DETAIL_SELECTOR = `${DETAIL_SELECTOR} a`;
  const COMMENT_CELL_SELECTOR = '.certifications-list-item__row-comment-cell';

  it('renders', async function() {
    await render(hbs`{{certifications-list-item certification=certification}}`);
    expect(find('.certifications-list-item__row-presentation')).to.exist;
  });

  context('when the certification is not published', function() {

    beforeEach(async function() {
      // given
      certification = EmberObject.create({
        id: 1,
        date: '2018-02-15T15:15:52.504Z',
        status: 'validated',
        certificationCenter: 'Université de Paris',
        isPublished: false,
        pixScore: 231,
      });
      this.set('certification', certification);

      // when
      await render(hbs`{{certifications-list-item certification=certification}}`);
    });

    // then
    it('should render a certifications-list-item__unpublished-item div', function() {
      expect(find('.certifications-list-item__unpublished-item')).to.exist;
    });

    it('should show en attente de résultat', function() {
      expect(find('img.certifications-list-item__hourglass-img')).to.exist;
      expect(find(STATUS_SELECTOR).textContent).to.include('En attente du résultat');
    });
  });

  context('when the certification is published and rejected', function() {

    context('without commentForCandidate', function() {
      beforeEach(async function() {
        // given
        certification = EmberObject.create({
          id: 1,
          date: '2018-02-15T15:15:52.504Z',
          status: 'rejected',
          certificationCenter: 'Université de Paris',
          isPublished: true,
          pixScore: 231,
          commentForCandidate: null,
        });
        this.set('certification', certification);

        // when
        await render(hbs`{{certifications-list-item certification=certification}}`);
      });

      // then
      it('should render a certifications-list-item__published-item div', function() {
        expect(find(PUBLISH_CLASS)).to.exist;
      });

      it('should show Certification non obtenue', function() {
        expect(find(IMG_FOR_STATUS_SELECTOR)).to.exist;
        expect(find(STATUS_SELECTOR).textContent).to.include('Certification non obtenue');
      });

      it('should not show Détail in last column', function() {
        expect(find(REJECTED_DETAIL_SELECTOR)).to.not.exist;
      });

      it('should not show comment for candidate panel when clicked on row', async function() {
        // when
        await click(CERTIFICATION_CELL_SELECTOR);

        // then
        expect(find(COMMENT_CELL_SELECTOR)).to.not.exist;
      });
    });

    context('with a commentForCandidate', function() {

      const commentForCandidate = 'Commentaire pour le candidat';

      beforeEach(async function() {
        // given
        certification = EmberObject.create({
          id: 1,
          date: '2018-02-15T15:15:52.504Z',
          status: 'rejected',
          certificationCenter: 'Université de Paris',
          isPublished: true,
          pixScore: 231,
          commentForCandidate: commentForCandidate,
        });
        this.set('certification', certification);

        // when
        await render(hbs`{{certifications-list-item certification=certification}}`);
      });

      // then
      it('should render a certifications-list-item__published-item div', function() {
        expect(find(PUBLISH_CLASS)).to.exist;
      });

      it('should show Certification non obtenue', function() {
        expect(find(IMG_FOR_STATUS_SELECTOR)).to.exist;
        expect(find(STATUS_SELECTOR).textContent).to.include('Certification non obtenue');
      });

      it('should show Détail in last column', function() {
        expect(find(REJECTED_DETAIL_SELECTOR)).to.exist;
        expect(find(REJECTED_DETAIL_SELECTOR).textContent).to.include('détail');
      });

      it('should show comment for candidate panel when clicked on row', async function() {

        await click(CERTIFICATION_CELL_SELECTOR);

        expect(find(COMMENT_CELL_SELECTOR)).to.exist;
        expect(find(COMMENT_CELL_SELECTOR).textContent).to.include(commentForCandidate);
      });
    });
  });

  context('when the certification is published and validated', function() {

    beforeEach(async function() {
      // given
      certification = EmberObject.create({
        id: 1,
        date: '2018-02-15T15:15:52.504Z',
        status: 'validated',
        certificationCenter: 'Université de Paris',
        isPublished: true,
        pixScore: 231,
      });
      this.set('certification', certification);

      // when
      await render(hbs`{{certifications-list-item certification=certification}}`);
    });

    // then
    it('should render certifications-list-item__published-item with a link inside', function() {
      expect(find(`${PUBLISH_CLASS} a`)).to.exist;
    });

    it('should show Certification obtenue', function() {
      expect(find('img.certifications-list-item__green-check-img')).to.exist;
      expect(find(STATUS_SELECTOR).textContent).to.include('Certification obtenue');
    });

    it('should show the Pix Score', function() {
      expect(find(PIX_SCORE_CELL_SELECTOR)).to.exist;
      expect(find(PIX_SCORE_CELL_SELECTOR).textContent).to.include('231');
    });

    it('should show link to certification page in last column', function() {
      expect(find(VALIDATED_DETAIL_SELECTOR)).to.exist;
      expect(find(VALIDATED_DETAIL_SELECTOR).textContent).to.include('résultats');
    });
  });
});
