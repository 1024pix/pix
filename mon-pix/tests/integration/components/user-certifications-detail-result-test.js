import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe('Integration | Component | user certifications detail result', function() {
  setupComponentTest('user-certifications-detail-result', {
    integration: true,
  });

  let certification;

  it('renders', function() {
    this.render(hbs`{{user-certifications-detail-result certification=certification}}`);
    expect(this.$()).to.have.length(1);
  });

  context('when certification is complete', function() {

    beforeEach(function() {
      // given
      certification = EmberObject.create({
        id: 1,
        birthdate: new Date('2000-01-22T15:15:52.504Z'),
        firstName: 'Jean',
        lastName: 'Bon',
        date: new Date('2018-02-15T15:15:52.504Z'),
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: 'Comment for candidate',
      });
      this.set('certification', certification);

      // when
      this.render(hbs`{{user-certifications-detail-result certification=certification}}`);
    });

    // then
    it('should show the pix score', function() {
      expect(this.$('.user-certifications-detail-result__pix-score')).to.have.lengthOf(1);
      expect(this.$('.user-certifications-detail-result__pix-score').text()).to.include('654');
    });

    it('should show the comment for candidate', function() {
      expect(this.$('.user-certifications-detail-result__comment-jury')).to.have.lengthOf(1);
      expect(this.$('.user-certifications-detail-result__comment-jury').text()).to.include('Comment for candidate');
    });
  });

  context('when certification has no comment for user', function() {

    beforeEach(function() {
      // given
      certification = EmberObject.create({
        id: 1,
        birthdate: new Date('2000-01-22T15:15:52.504Z'),
        firstName: 'Jean',
        lastName: 'Bon',
        date: new Date('2018-02-15T15:15:52.504Z'),
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: null,
      });
      this.set('certification', certification);

      // when
      this.render(hbs`{{user-certifications-detail-result certification=certification}}`);
    });

    // then
    it('should show the pix score', function() {
      expect(this.$('.user-certifications-detail-result__pix-score')).to.have.lengthOf(1);
      expect(this.$('.user-certifications-detail-result__pix-score').text()).to.include('654');
    });

    it('should not show the comment for candidate', function() {
      expect(this.$('.user-certifications-detail-result__comment-jury')).to.have.lengthOf(0);
    });
  });

});
