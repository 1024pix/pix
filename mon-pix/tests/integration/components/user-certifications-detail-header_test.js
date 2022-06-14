import { expect } from 'chai';
import { describe, it } from 'mocha';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import Service from '@ember/service';

describe('Integration | Component | user certifications detail header', function () {
  setupIntlRenderingTest();

  context('when certification is complete', function () {
    let certification, screen;
    let store;

    beforeEach(async function () {
      // given
      store = this.owner.lookup('service:store');
      certification = store.createRecord('certification', {
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
      screen = await renderScreen(hbs`{{user-certifications-detail-header certification=certification}}`);
    });

    it('should show the certification published date', function () {
      expect(screen.getByText('Délivré le 17 février 2018')).to.exist;
    });

    it('should show the certification exam date', function () {
      expect(screen.getByText('Date de passage : 15 février 2018')).to.exist;
    });

    it('should show the certification user full name', function () {
      expect(screen.getByText('Jean Bon')).to.exist;
    });

    it('should show the certification user birthdate and birthplace', function () {
      expect(screen.getByText('Né(e) le 22 janvier 2000 à Paris')).to.exist;
    });

    it('should show the certification center', function () {
      expect(screen.getByText('Centre de certification : Université de Lyon')).to.exist;
    });

    it('should show the pix score', function () {
      expect(screen.getByText('654')).to.exist;
    });
  });

  context('when certification is not complete', function () {
    it('should not render the user-certifications-detail-header component', async function () {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        id: 1,
        birthdate: '2000-01-22',
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
      const screen = await renderScreen(hbs`{{user-certifications-detail-header certification=certification}}`);

      // then
      expect(screen.queryByText('Né(e) le 22 janvier 2000 à Paris')).to.not.exist;
    });
  });

  context('when domain is french', function () {
    beforeEach(function () {
      class UrlServiceStub extends Service {
        get isFrenchDomainExtension() {
          return true;
        }
      }
      this.owner.register('service:url', UrlServiceStub);
    });

    context('when certification is delivered after 2022-01-01', function () {
      it('should display the professionalizing warning', async function () {
        // given
        const store = this.owner.lookup('service:store');
        const certification = store.createRecord('certification', {
          id: 1,
          birthdate: '2000-01-22',
          birthplace: 'Paris',
          firstName: 'jean',
          lastName: 'bon',
          fullName: 'Jean Bon',
          date: new Date('2018-02-15T15:15:52Z'),
          deliveredAt: '2022-05-28',
          certificationCenter: 'Université de Lyon',
          isPublished: true,
          pixScore: 654,
          status: 'validated',
          commentForCandidate: 'Comment for candidate',
        });
        this.set('certification', certification);

        // when
        const screen = await renderScreen(hbs`{{user-certifications-detail-header certification=certification}}`);

        // then
        expect(
          screen.getByText(
            'Le certificat Pix est reconnu comme professionnalisant par France compétences à compter d’un score minimal de 120 pix'
          )
        ).to.exist;
      });
    });

    context('when certification is delivered before 2022-01-01', function () {
      it('should not display the professionalizing warning', async function () {
        // given
        const store = this.owner.lookup('service:store');
        const certification = store.createRecord('certification', {
          id: 1,
          birthdate: '2000-01-22',
          birthplace: 'Paris',
          firstName: 'jean',
          lastName: 'bon',
          fullName: 'Jean Bon',
          date: new Date('2018-02-15T15:15:52Z'),
          deliveredAt: '2021-05-28',
          certificationCenter: 'Université de Lyon',
          isPublished: true,
          pixScore: 654,
          status: 'validated',
          commentForCandidate: 'Comment for candidate',
        });
        this.set('certification', certification);

        // when
        const screen = await renderScreen(hbs`{{user-certifications-detail-header certification=certification}}`);

        // then
        expect(
          screen.queryByText(
            'Le certificat Pix est reconnu comme professionnalisant par France compétences à compter d’un score minimal de 120 pix'
          )
        ).to.not.exist;
      });
    });
  });

  context('when domain is not french', function () {
    it('should not display the professionalizing warning', async function () {
      // given
      class UrlServiceStub extends Service {
        get isFrenchDomainExtension() {
          return false;
        }
      }
      this.owner.register('service:url', UrlServiceStub);
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        id: 1,
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'jean',
        lastName: 'bon',
        fullName: 'Jean Bon',
        date: new Date('2018-02-15T15:15:52Z'),
        deliveredAt: '2022-05-28',
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: 'Comment for candidate',
      });
      this.set('certification', certification);

      // when
      const screen = await renderScreen(hbs`{{user-certifications-detail-header certification=certification}}`);

      // then
      expect(
        screen.queryByText(
          'Le certificat Pix est reconnu comme professionnalisant par France compétences à compter d’un score minimal de 120 pix'
        )
      ).to.not.exist;
    });
  });
});
