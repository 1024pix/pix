import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe('Integration | Component | user certifications detail header', function() {
  setupRenderingTest();

  let certification;

  it('renders', async function() {
    await render(hbs`{{user-certifications-detail-header certification=certification}}`);
    expect(find('.user-certifications-detail-header')).to.exist;
  });

  context('when certification is complete', function() {

    beforeEach(async function() {
      // given
      certification = EmberObject.create({
        id: 1,
        birthdate: '2000-01-22',
        birthplace: 'Paris',
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
      await render(hbs`{{user-certifications-detail-header certification=certification}}`);
    });

    // then
    it('should show the certification icon', function() {
      expect(find('.user-certifications-detail-header__icon')).to.exist;
    });

    it('should show the certification date', function() {
      expect(find('.user-certifications-detail-header__data-box')).to.exist;
      expect(find('.user-certifications-detail-header__data-box').textContent).to.include('15 février 2018');
    });

    it('should show the certification user full name', function() {
      expect(find('.user-certifications-detail-header__data-box').textContent).to.include('Nom : Jean Bon');
    });

    it('should show the certification user birthdate', function() {
      expect(find('.user-certifications-detail-header__data-box').textContent).to.include('Date de naissance : 22' +
        ' janvier 2000');
    });

    it('should show the certification user birthplace', function() {
      expect(find('.user-certifications-detail-header__data-box').textContent).to.include('Lieu de naissance : Paris');
    });

    it('should show the certification center', function() {
      expect(find('.user-certifications-detail-header__data-box').textContent).to.include('Centre de' +
        ' certification : Université de Lyon');
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
    it('should not show the certification date', function() {
      expect(find('.user-certifications-detail-header__data-box').textContent).to.not.include('obtenue le');
    });

    it('should not show the certification user full name', function() {
      expect(find('.user-certifications-detail-header__data-box').textContent).to.not.include('Nom :');
    });

    it('should not show the certification user birthdate', function() {
      expect(find('.user-certifications-detail-header__data-box').textContent).to.not.include('Date de naissance :');
    });

    it('should not show the certification user birthplace', function() {
      expect(find('.user-certifications-detail-header__data-box').textContent).to.not.include('Lieu de naissance :');
    });

    it('should not show the certification center', function() {
      expect(find('.user-certifications-detail-header__data-box').textContent).to.not.include('Centre de' +
        ' certification :');
    });
  });
});
