import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { run } from '@ember/runloop';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe('Integration | Component | certifications list item', function() {
  setupComponentTest('certifications-list-item', {
    integration: true,
  });

  let certification;

  it('renders', function() {
    this.render(hbs`{{certifications-list-item certification=certification}}`);
    expect(this.$()).to.have.length(1);
  });

  context('when the certification is not published', function() {

    beforeEach(function() {
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
      this.render(hbs`{{certifications-list-item certification=certification}}`);
    });

    // then
    it('should render a certifications-list-item__unpublished-item div', function() {
      expect(this.$('.certifications-list-item__unpublished-item')).to.have.lengthOf(1);
    });

    it('should show en attente de résultat', function() {
      expect(this.$('img.certifications-list-item__hourglass-img')).to.have.lengthOf(1);
      expect(this.$('.certifications-list-item').text()).to.include('En attente du résultat');
    });
  });

  context('when the certification is published and rejected', function() {

    context('without commentForCandidate', function() {
      beforeEach(function() {
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
        this.render(hbs`{{certifications-list-item certification=certification}}`);
      });

      // then
      it('should render a certifications-list-item__published-item div', function() {
        expect(this.$('.certifications-list-item__published-item')).to.have.lengthOf(1);
      });

      it('should show Certification non obtenue', function() {
        expect(this.$('img.certifications-list-item__cross-img')).to.have.lengthOf(1);
        expect(this.$('.certifications-list-item').text()).to.include('Certification non obtenue');
      });

      it('should not show Détail in last column', function() {
        expect(this.$('.certifications-list-item__cell-detail-button')).to.have.lengthOf(0);
      });

      it('should not show comment for candidate panel when clicked on row', async function() {

        run(() => document.querySelector(('.certifications-list-item__cell')).click());

        expect(this.$('.certifications-list-item__row-comment-cell')).to.have.lengthOf(0);
      });
    });

    context('with a commentForCandidate', function() {

      const commentForCandidate = 'Commentaire pour le candidat';

      beforeEach(function() {
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
        this.render(hbs`{{certifications-list-item certification=certification}}`);
      });

      // then
      it('should render a certifications-list-item__published-item div', function() {
        expect(this.$('.certifications-list-item__published-item')).to.have.lengthOf(1);
      });

      it('should show Certification non obtenue', function() {
        expect(this.$('img.certifications-list-item__cross-img')).to.have.lengthOf(1);
        expect(this.$('.certifications-list-item').text()).to.include('Certification non obtenue');
      });

      it('should show Détail in last column', function() {
        expect(this.$('.certifications-list-item__cell-detail-button')).to.have.lengthOf(1);
        expect(this.$('.certifications-list-item__cell-detail-button').text()).to.include('DÉTAIL');
      });

      it('should show comment for candidate panel when clicked on row', async function() {

        run(() => document.querySelector(('.certifications-list-item__cell')).click());

        expect(this.$('.certifications-list-item__row-comment-cell')).to.have.lengthOf(1);
        expect(this.$('.certifications-list-item__row-comment-cell').text()).to.include(commentForCandidate);
      });
    });
  });

  context('when the certification is published and validated', function() {

    beforeEach(function() {
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
      this.render(hbs`{{certifications-list-item certification=certification}}`);
    });

    // then
    it('should render certifications-list-item__published-item with a link inside', function() {
      expect(this.$('.certifications-list-item__published-item a')).to.have.lengthOf(1);
    });

    it('should show Certification obtenue', function() {
      expect(this.$('img.certifications-list-item__green-check-img')).to.have.lengthOf(1);
      expect(this.$('.certifications-list-item').text()).to.include('Certification obtenue');
    });

    it('should show the Pix Score', function() {
      expect(this.$('.certifications-list-item__pix-score')).to.have.lengthOf(1);
      expect(this.$('.certifications-list-item__pix-score').text()).to.include('231');
    });

    it('should show link to certification page in last column', function() {
      expect(this.$('.certifications-list-item__cell-detail-link')).to.have.lengthOf(1);
      expect(this.$('.certifications-list-item__cell-detail-link').text()).to.include('RÉSULTATS');
    });
  });
});
