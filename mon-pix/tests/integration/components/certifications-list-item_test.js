import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { click, find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

describe('Integration | Component | certifications list item', function () {
  setupIntlRenderingTest();

  const PUBLISH_CLASS = '.certifications-list-item__published-item';
  const UNPUBLISH_CLASS = '.certifications-list-item__unpublished-item';
  const CERTIFICATION_CELL_SELECTOR = '.certifications-list-item__cell';
  const STATUS_SELECTOR = '.certifications-list-item__cell-double-width';
  const IMG_FOR_STATUS_SELECTOR = 'img[data-test-id="certifications-list-item__cross-img"]';
  const IMG_FOR_WAITING_STATUS_SELECTOR = 'img[data-test-id="certifications-list-item__hourglass-img"]';
  const PIX_SCORE_CELL_SELECTOR = '.certifications-list-item__pix-score';
  const DETAIL_SELECTOR = '.certifications-list-item__cell-detail';
  const REJECTED_DETAIL_SELECTOR = `${DETAIL_SELECTOR} button`;
  const VALIDATED_DETAIL_SELECTOR = `${DETAIL_SELECTOR} a`;
  const COMMENT_CELL_SELECTOR = '.certifications-list-item__row-comment-cell';
  const NOT_CLICKABLE_SELECTOR = '.certifications-list-item__not-clickable';
  const CLICKABLE_SELECTOR = '.certifications-list-item__clickable';

  const commentForCandidate = 'Commentaire pour le candidat';

  it('renders', async function () {
    await render(hbs`<CertificationsListItem />`);
    expect(find('.certifications-list-item__row-presentation')).to.exist;
  });

  context('when the certification is not published', function () {
    beforeEach(async function () {
      // given
      const certification = createCertification({
        status: 'validated',
        isPublished: false,
        commentForCandidate: null,
      });
      this.set('certification', certification);

      // when
      await render(hbs`<CertificationsListItem @certification={{this.certification}}/>`);
    });

    // then
    it('should render a certifications-list-item__unpublished-item div', function () {
      expect(find(UNPUBLISH_CLASS)).to.exist;
    });

    it('should show en attente de résultat', function () {
      expect(find(IMG_FOR_WAITING_STATUS_SELECTOR)).to.exist;
      expect(find(STATUS_SELECTOR).textContent).to.include('En attente du résultat');
    });

    it('should not be clickable', function () {
      expect(find(NOT_CLICKABLE_SELECTOR)).to.exist;
      expect(find(CLICKABLE_SELECTOR)).not.to.exist;
    });
  });

  context('when the certification is published and rejected', function () {
    context('without commentForCandidate', function () {
      beforeEach(async function () {
        // given
        const certification = createCertification({
          status: 'rejected',
          isPublished: true,
          commentForCandidate: null,
        });

        this.set('certification', certification);

        // when
        await render(hbs`<CertificationsListItem @certification={{this.certification}}/>`);
      });

      // then
      it('should render a certifications-list-item__published-item div', function () {
        expect(find(PUBLISH_CLASS)).to.exist;
      });

      it('should show Certification non obtenue', function () {
        expect(find(IMG_FOR_STATUS_SELECTOR)).to.exist;
        expect(find(STATUS_SELECTOR).textContent).to.include('Certification non obtenue');
      });

      it('should not show Détail in last column', function () {
        expect(find(REJECTED_DETAIL_SELECTOR)).to.not.exist;
      });

      it('should not show comment for candidate panel when clicked on row', async function () {
        // when
        await click(CERTIFICATION_CELL_SELECTOR);

        // then
        expect(find(COMMENT_CELL_SELECTOR)).to.not.exist;
      });

      it('should not be clickable', function () {
        expect(find(NOT_CLICKABLE_SELECTOR)).to.exist;
        expect(find(CLICKABLE_SELECTOR)).not.to.exist;
      });
    });

    context('with a commentForCandidate', function () {
      beforeEach(async function () {
        // given
        const certification = createCertification({
          status: 'rejected',
          isPublished: true,
          commentForCandidate,
        });
        this.set('certification', certification);

        // when
        await render(hbs`<CertificationsListItem @certification={{this.certification}}/>`);
      });

      // then
      it('should render a certifications-list-item__published-item div', function () {
        expect(find(PUBLISH_CLASS)).to.exist;
      });

      it('should show Certification non obtenue', function () {
        expect(find(IMG_FOR_STATUS_SELECTOR)).to.exist;
        expect(find(STATUS_SELECTOR).textContent).to.include('Certification non obtenue');
      });

      it('should show Détail in last column', function () {
        expect(find(REJECTED_DETAIL_SELECTOR)).to.exist;
        expect(find(REJECTED_DETAIL_SELECTOR).textContent).to.include('détail');
      });

      it('should show comment for candidate panel when clicked on row', async function () {
        await click(CERTIFICATION_CELL_SELECTOR);

        expect(find(COMMENT_CELL_SELECTOR)).to.exist;
        expect(find(COMMENT_CELL_SELECTOR).textContent).to.include(commentForCandidate);
      });

      it('should be clickable', function () {
        expect(find(CLICKABLE_SELECTOR)).to.exist;
        expect(find(NOT_CLICKABLE_SELECTOR)).not.to.exist;
      });
    });
  });

  context('when the certification is published and validated', function () {
    beforeEach(async function () {
      // given
      const certification = createCertification({
        status: 'validated',
        isPublished: true,
      });
      this.set('certification', certification);

      // when
      await render(hbs`<CertificationsListItem @certification={{this.certification}}/>`);
    });

    // then
    it('should render certifications-list-item__published-item with a link inside', function () {
      expect(find(`${PUBLISH_CLASS} a`)).to.exist;
    });

    it('should show Certification obtenue', function () {
      expect(find('img[data-test-id="certifications-list-item__green-check-img"]')).to.exist;
      expect(find(STATUS_SELECTOR).textContent).to.include('Certification obtenue');
    });

    it('should show the Pix Score', function () {
      expect(find(PIX_SCORE_CELL_SELECTOR)).to.exist;
      expect(find(PIX_SCORE_CELL_SELECTOR).textContent).to.include('231');
    });

    it('should show link to certification page in last column', function () {
      expect(find(VALIDATED_DETAIL_SELECTOR)).to.exist;
      expect(find(VALIDATED_DETAIL_SELECTOR).textContent).to.include('résultats');
    });

    it('should be clickable', function () {
      expect(find(CLICKABLE_SELECTOR)).to.exist;
      expect(find(NOT_CLICKABLE_SELECTOR)).not.to.exist;
    });
  });

  context('when the certification is cancelled', function () {
    context('and is published', function () {
      context('and and has no comments', function () {
        it('should show Certification annulée without comments', async function () {
          // given
          const certification = createCertification({
            status: 'cancelled',
            isPublished: true,
          });
          this.set('certification', certification);

          // when
          await render(hbs`<CertificationsListItem @certification={{this.certification}}/>`);

          expect(find(PUBLISH_CLASS)).to.exist;
          expect(find(IMG_FOR_STATUS_SELECTOR)).to.exist;
          expect(find(STATUS_SELECTOR).textContent).to.include('Certification annulée');

          expect(find('button')).not.to.exist;
        });

        it('should not be clickable', async function () {
          // given
          const certification = createCertification({
            status: 'cancelled',
            isPublished: true,
          });
          this.set('certification', certification);

          // when
          await render(hbs`<CertificationsListItem @certification={{this.certification}}/>`);

          expect(find(NOT_CLICKABLE_SELECTOR)).to.exist;
          expect(find(CLICKABLE_SELECTOR)).not.to.exist;
        });
      });

      context('and and has comments', function () {
        it('should show Certification annulée with comments', async function () {
          // given
          const certification = EmberObject.create({
            id: 1,
            date: '2018-02-15T15:15:52.504Z',
            status: 'cancelled',
            certificationCenter: 'Université de Paris',
            isPublished: true,
            commentForCandidate: 'random',
          });

          this.set('certification', certification);

          // when
          await render(hbs`<CertificationsListItem @certification={{this.certification}}/>`);

          expect(find('button')).to.exist;
        });
      });

      it('should be clickable', async function () {
        // given
        const certification = createCertification({
          status: 'cancelled',
          isPublished: true,
          commentForCandidate,
        });
        this.set('certification', certification);

        // when
        await render(hbs`<CertificationsListItem @certification={{this.certification}}/>`);

        expect(find(CLICKABLE_SELECTOR)).to.exist;
        expect(find(NOT_CLICKABLE_SELECTOR)).not.to.exist;
      });
    });

    context('and is not published', function () {
      beforeEach(async function () {
        // given
        const certification = createCertification({
          status: 'cancelled',
          isPublished: false,
        });
        this.set('certification', certification);

        // when
        await render(hbs`<CertificationsListItem @certification={{this.certification}}/>`);
      });

      // then
      it('should render a certifications-list-item__unpublished-item div', function () {
        expect(find(UNPUBLISH_CLASS)).to.exist;
      });

      it('should not show Certification annulée', function () {
        expect(find(IMG_FOR_STATUS_SELECTOR)).not.to.exist;
      });
    });
  });
});

function createCertification({ status, isPublished, commentForCandidate }) {
  return EmberObject.create({
    id: 1,
    date: '2018-02-15T15:15:52.504Z',
    certificationCenter: 'Université de Paris',
    pixScore: 231,
    status,
    isPublished,
    commentForCandidate,
  });
}
