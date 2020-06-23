import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe('Integration | Component | user certifications detail header', function() {
  setupRenderingTest();

  let certification;
  const PARENT_SELECTOR = '.user-certifications-detail-header';
  const CONTENT_SELECTOR = `${PARENT_SELECTOR}__info-certificate`;

  context('when certification is complete', function() {

    beforeEach(async function() {
      // given
      certification = EmberObject.create({
        id: 1,
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'jean',
        lastName: 'bon',
        fullName: 'Jean Bon',
        date: new Date('2018-02-15T15:15:52Z'),
        deliveredAt: new Date('2018-02-17T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: 'Comment for candidate',
      });
      this.set('certification', certification);

      // when
      await render(hbs`{{user-certifications-detail-header certification=certification}}`);
    });

    it('renders', async function() {
      expect(find(PARENT_SELECTOR)).to.exist;
    });

    it('should show the certification published date', function() {
      expect(find(CONTENT_SELECTOR)).to.exist;
      expect(find(`${CONTENT_SELECTOR} :nth-child(2)`).textContent)
        .to.include('Délivré le 17 février 2018');
    });

    it('should show the certification exam date', function() {
      expect(find(`${CONTENT_SELECTOR} :nth-child(7)`).textContent)
        .to.include('Date de passage : 15 février 2018');
    });

    it('should show the certification user full name', function() {
      expect(find(`${CONTENT_SELECTOR} :nth-child(4)`).textContent)
        .to.include('Jean Bon');
    });

    it('should show the certification user birthdate and birthplace', function() {
      expect(find(`${CONTENT_SELECTOR} :nth-child(5)`).textContent)
        .to.include('Né(e) le 22 janvier 2000 à Paris');
    });

    it('should show the certification center', function() {
      expect(find(`${CONTENT_SELECTOR} :nth-child(6)`).textContent)
        .to.include('Centre de certification : Université de Lyon');
    });

    it('should show the pix score', function() {
      const scoreHexagon = find(`${PARENT_SELECTOR} .user-certification-hexagon-score__content-pix-score`);
      expect(scoreHexagon).to.exist;
      expect(scoreHexagon.textContent).to.include('654');
    });
  });

  context('when certification is not complete', function() {

    beforeEach(async function() {
      // given
      certification = EmberObject.create({
        id: 1,
        birthdate: null,
        birthplace: null,
        firstName: null,
        lastName: null,
        date: null,
        certificationCenter: null,
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: 'Comment for candidate',
      });
      this.set('certification', certification);

      // when
      await render(hbs`{{user-certifications-detail-header certification=certification}}`);
    });

    // then
    it('should not render the user-certifications-detail-header component', function() {
      expect(find(PARENT_SELECTOR)).to.not.exist;
    });
  });
});
