import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { click, find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe('Integration | Component | certifications list item', function() {
  setupRenderingTest();

  let certification;

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
      expect(find('.certifications-list-item').textContent).to.include('En attente du résultat');
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
        expect(find('.certifications-list-item__published-item')).to.exist;
      });

      it('should show Certification non obtenue', function() {
        expect(find('img.certifications-list-item__cross-img')).to.exist;
        expect(find('.certifications-list-item').textContent).to.include('Certification non obtenue');
      });

      it('should not show Détail in last column', function() {
        expect(find('.certifications-list-item__cell-detail-button')).to.not.exist;
      });

      it('should not show comment for candidate panel when clicked on row', async function() {

        await click('.certifications-list-item__cell');

        expect(find('.certifications-list-item__row-comment-cell')).to.not.exist;
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
        expect(find('.certifications-list-item__published-item')).to.exist;
      });

      it('should show Certification non obtenue', function() {
        expect(find('img.certifications-list-item__cross-img')).to.exist;
        expect(find('.certifications-list-item').textContent).to.include('Certification non obtenue');
      });

      it('should show Détail in last column', function() {
        expect(find('.certifications-list-item__cell-detail-button')).to.exist;
        expect(find('.certifications-list-item__cell-detail-button').textContent).to.include('DÉTAIL');
      });

      it('should show comment for candidate panel when clicked on row', async function() {

        await click('.certifications-list-item__cell');

        expect(find('.certifications-list-item__row-comment-cell')).to.exist;
        expect(find('.certifications-list-item__row-comment-cell').textContent).to.include(commentForCandidate);
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
      expect(find('.certifications-list-item__published-item a')).to.exist;
    });

    it('should show Certification obtenue', function() {
      expect(find('img.certifications-list-item__green-check-img')).to.exist;
      expect(find('.certifications-list-item').textContent).to.include('Certification obtenue');
    });

    it('should show the Pix Score', function() {
      expect(find('.certifications-list-item__pix-score')).to.exist;
      expect(find('.certifications-list-item__pix-score').textContent).to.include('231');
    });

    it('should show link to certification page in last column', function() {
      expect(find('.certifications-list-item__cell-detail-link')).to.exist;
      expect(find('.certifications-list-item__cell-detail-link').textContent).to.include('RÉSULTATS');
    });
  });
});
