import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe('Integration | Component | user certifications detail result', function() {
  setupRenderingTest();

  let certification;

  it('renders', async function() {
    await render(hbs`{{user-certifications-detail-result certification=certification}}`);
    expect(find('.user-certifications-detail-result')).to.exist;
  });

  context('when certification is complete', function() {

    beforeEach(async function() {
      // given
      certification = EmberObject.create({
        id: 1,
        birthdate: new Date('2000-01-22T15:15:52Z'),
        firstName: 'Jean',
        lastName: 'Bon',
        date: new Date('2018-02-15T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: 'Comment for candidate',
      });
      this.set('certification', certification);

      // when
      await render(hbs`{{user-certifications-detail-result certification=certification}}`);
    });

    // then
    it('should show the pix score', function() {
      expect(find('.user-certifications-detail-result__pix-score')).to.exist;
      expect(find('.user-certifications-detail-result__pix-score').textContent).to.include('654');
    });

    it('should show the comment for candidate', function() {
      expect(find('.user-certifications-detail-result__comment-jury')).to.exist;
      expect(find('.user-certifications-detail-result__comment-jury').textContent).to.include('Comment for candidate');
    });
  });

  context('when certification has no comment for user', function() {

    beforeEach(async function() {
      // given
      certification = EmberObject.create({
        id: 1,
        birthdate: new Date('2000-01-22T15:15:52Z'),
        firstName: 'Jean',
        lastName: 'Bon',
        date: new Date('2018-02-15T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: null,
      });
      this.set('certification', certification);

      // when
      await render(hbs`{{user-certifications-detail-result certification=certification}}`);
    });

    // then
    it('should show the pix score', function() {
      expect(find('.user-certifications-detail-result__pix-score')).to.exist;
      expect(find('.user-certifications-detail-result__pix-score').textContent).to.include('654');
    });

    it('should not show the comment for candidate', function() {
      expect(find('.user-certifications-detail-result__comment-jury')).to.not.exist;
    });
  });

});
