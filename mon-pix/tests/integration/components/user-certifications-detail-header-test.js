import { render as renderScreen } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubCurrentUserService } from '../../helpers/service-stubs';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | user certifications detail header', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when certification is complete', function (hooks) {
    let certification, screen;
    let store;

    hooks.beforeEach(async function () {
      // given
      stubCurrentUserService(this.owner);
      store = this.owner.lookup('service:store');
      certification = store.createRecord('certification', {
        id: '1',
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Bon',
        date: new Date('2018-02-15T15:15:52Z'),
        deliveredAt: new Date('2018-02-17T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: 'Comment for candidate',
        version: 2,
      });
      this.set('certification', certification);

      // when
      screen = await renderScreen(
        hbs`<Certifications::UserCertificationsDetailHeader @certification={{this.certification}} />`,
      );
    });

    test('should show the certification published date', function (assert) {
      assert.ok(screen.getByText('Délivré le 17 février 2018'));
    });

    test('should show the certification exam date', function (assert) {
      assert.ok(screen.getByText('Date de passage : 15 février 2018'));
    });

    test('should show the certification user full name', function (assert) {
      assert.ok(screen.getByText('Jean Bon'));
    });

    test('should show the certification user birthdate and birthplace', function (assert) {
      assert.ok(screen.getByText('Né(e) le 22 janvier 2000 à Paris'));
    });

    test('should show the certification center', function (assert) {
      assert.ok(screen.getByText('Centre de certification : Université de Lyon'));
    });

    test('should show the pix score', function (assert) {
      assert.ok(screen.getByText('654'));
    });
  });

  module('when certification is not complete', function () {
    test('should not render the user-certifications-detail-header component', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        id: '1',
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
      const screen = await renderScreen(
        hbs`<Certifications::UserCertificationsDetailHeader @certification={{this.certification}} />`,
      );

      // then
      assert.notOk(screen.queryByText('Né(e) le 22 janvier 2000 à Paris'));
    });
  });

  module('when domain is french', function (hooks) {
    hooks.beforeEach(function () {
      stubCurrentUserService(this.owner, { lang: 'fr' });
      class CurrentDomainServiceStub extends Service {
        get isFranceDomain() {
          return true;
        }
      }

      this.owner.register('service:currentDomain', CurrentDomainServiceStub);
    });

    module('when certification is v2 and delivered after 2022-01-01', function () {
      test('should display the professionalizing warning', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certification = store.createRecord('certification', {
          id: '1',
          birthdate: '2000-01-22',
          birthplace: 'Paris',
          firstName: 'Jean',
          lastName: 'Bon',
          date: new Date('2018-02-15T15:15:52Z'),
          deliveredAt: '2022-05-28',
          certificationCenter: 'Université de Lyon',
          isPublished: true,
          pixScore: 654,
          status: 'validated',
          commentForCandidate: 'Comment for candidate',
          version: 2,
        });
        this.set('certification', certification);

        // when
        const screen = await renderScreen(
          hbs`<Certifications::UserCertificationsDetailHeader @certification={{this.certification}} />`,
        );

        // then
        assert.ok(
          screen.getByText(
            'Le certificat Pix est reconnu comme professionnalisant par France compétences à compter d’un score minimal de 120 pix',
          ),
        );
      });
    });

    module('when certification is v2 and delivered before 2022-01-01', function () {
      test('should not display the professionalizing warning', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certification = store.createRecord('certification', {
          id: '1',
          birthdate: '2000-01-22',
          birthplace: 'Paris',
          firstName: 'Jean',
          lastName: 'Bon',
          date: new Date('2018-02-15T15:15:52Z'),
          deliveredAt: '2021-05-28',
          certificationCenter: 'Université de Lyon',
          isPublished: true,
          pixScore: 654,
          status: 'validated',
          commentForCandidate: 'Comment for candidate',
          version: 2,
        });
        this.set('certification', certification);

        // when
        const screen = await renderScreen(
          hbs`<Certifications::UserCertificationsDetailHeader @certification={{this.certification}} />`,
        );

        // then
        assert.notOk(
          screen.queryByText(
            'Le certificat Pix est reconnu comme professionnalisant par France compétences à compter d’un score minimal de 120 pix',
          ),
        );
      });
    });

    module('when certification is v3', function () {
      test('should not display the professionalizing warning', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certification = store.createRecord('certification', {
          id: '1',
          birthdate: '2000-01-22',
          birthplace: 'Paris',
          firstName: 'Jean',
          lastName: 'Bon',
          date: new Date('2018-02-15T15:15:52Z'),
          deliveredAt: '2022-05-28',
          certificationCenter: 'Université de Lyon',
          isPublished: true,
          pixScore: 654,
          status: 'validated',
          commentForCandidate: 'Comment for candidate',
          version: 3,
        });
        this.set('certification', certification);

        // when
        const screen = await renderScreen(
          hbs`<Certifications::UserCertificationsDetailHeader @certification={{this.certification}} />`,
        );

        // then
        assert.notOk(
          screen.queryByText(
            'Le certificat Pix est reconnu comme professionnalisant par France compétences à compter d’un score minimal de 120 pix',
          ),
        );
      });
    });

    test('should call file saver with isFrenchDomainExtension set to true in url', async function (assert) {
      // given
      const fileSaverSaveStub = sinon.stub();

      class FileSaverStub extends Service {
        save = fileSaverSaveStub;
      }

      this.owner.register('service:fileSaver', FileSaverStub);

      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        id: '1234',
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Bon',
        date: new Date('2018-02-15T15:15:52Z'),
        deliveredAt: '2021-05-28',
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: 'Comment for candidate',
        verificationCode: 'P-122344',
      });
      this.set('certification', certification);

      const screen = await renderScreen(
        hbs`<Certifications::UserCertificationsDetailHeader @certification={{this.certification}} />`,
      );

      // when
      await click(screen.getByRole('button', { name: t('pages.certificate.actions.download') }));

      // then
      sinon.assert.calledWith(fileSaverSaveStub, {
        url: '/api/attestation/1234?isFrenchDomainExtension=true&lang=fr',
        token: undefined,
      });
      assert.ok(true);
    });

    test('should display a link to the results explanation', async function (assert) {
      // given
      stubCurrentUserService(this.owner, { lang: 'en' });
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        date: new Date('2018-02-15T15:15:52Z'),
        isPublished: true,
        status: 'validated',
        version: 3,
      });
      this.set('certification', certification);

      // when
      const screen = await renderScreen(
        hbs`<Certifications::UserCertificationsDetailHeader @certification={{this.certification}} />`,
      );

      // then
      assert
        .dom(screen.getByRole('link', { name: t('pages.certificate.learn-about-certification-results') }))
        .hasAttribute('href', 'https://pix.fr/certification-comprendre-score-niveau');
    });
  });

  module('when domain is not french', function (hooks) {
    hooks.beforeEach(function () {
      stubCurrentUserService(this.owner, { lang: 'en' });
    });

    test('should not display the professionalizing warning', async function (assert) {
      // given
      class CurrentDomainServiceStub extends Service {
        get isFranceDomain() {
          return false;
        }
      }

      this.owner.register('service:currentDomain', CurrentDomainServiceStub);

      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        id: '1',
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Bon',
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
      const screen = await renderScreen(
        hbs`<Certifications::UserCertificationsDetailHeader @certification={{this.certification}} />`,
      );

      // then
      assert.notOk(
        screen.queryByText(
          'Le certificat Pix est reconnu comme professionnalisant par France compétences à compter d’un score minimal de 120 pix',
        ),
      );
    });

    test('should call file saver with isFrenchDomainExtension set to false in url', async function (assert) {
      // given
      const fileSaverSaveStub = sinon.stub();

      class FileSaverStub extends Service {
        save = fileSaverSaveStub;
      }

      this.owner.register('service:fileSaver', FileSaverStub);

      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        id: '1234',
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Bon',
        date: new Date('2018-02-15T15:15:52Z'),
        deliveredAt: '2021-05-28',
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: 'Comment for candidate',
        verificationCode: 'P-122344',
      });
      this.set('certification', certification);

      const screen = await renderScreen(
        hbs`<Certifications::UserCertificationsDetailHeader @certification={{this.certification}} />`,
      );

      // when
      await click(screen.getByRole('button', { name: t('pages.certificate.actions.download') }));

      // then
      sinon.assert.calledWith(fileSaverSaveStub, {
        url: '/api/attestation/1234?isFrenchDomainExtension=false&lang=fr',
        token: undefined,
      });
      assert.ok(true);
    });

    module('when user is a French reader', function () {
      test('should display a link to the results explanation', async function (assert) {
        // given
        stubCurrentUserService(this.owner, { lang: 'fr' });

        const store = this.owner.lookup('service:store');
        const certification = store.createRecord('certification', {
          birthdate: '2000-01-22',
          date: new Date('2018-02-15T15:15:52Z'),
          isPublished: true,
          status: 'validated',
          version: 3,
        });
        this.set('certification', certification);

        // when
        const screen = await renderScreen(
          hbs`<Certifications::UserCertificationsDetailHeader @certification={{this.certification}} />`,
        );

        // then
        assert
          .dom(screen.getByRole('link', { name: t('pages.certificate.learn-about-certification-results') }))
          .hasAttribute('href', 'https://pix.org/fr/certification-comprendre-score-niveau');
      });
    });

    module('when user is not a French reader', function () {
      test('should not display a link to the results explanation', async function (assert) {
        // given
        stubCurrentUserService(this.owner, { lang: 'en' });
        const store = this.owner.lookup('service:store');
        const certification = store.createRecord('certification', {
          birthdate: '2000-01-22',
          date: new Date('2018-02-15T15:15:52Z'),
          isPublished: true,
          status: 'validated',
        });
        this.set('certification', certification);

        // when
        const screen = await renderScreen(
          hbs`<Certifications::UserCertificationsDetailHeader @certification={{this.certification}} />`,
        );

        // then
        assert
          .dom(screen.queryByRole('link', { name: t('pages.certificate.learn-about-certification-results') }))
          .doesNotExist();
      });
    });
  });

  module('when there is an error during the download of the attestation', function () {
    test('should show the common error message', async function (assert) {
      // given
      stubCurrentUserService(this.owner);
      const fileSaverSaveStub = sinon.stub();

      class FileSaverStub extends Service {
        save = fileSaverSaveStub;
      }

      this.owner.register('service:fileSaver', FileSaverStub);

      fileSaverSaveStub.rejects(new Error('an error message'));

      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        id: '1234',
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Bon',
        date: new Date('2018-02-15T15:15:52Z'),
        deliveredAt: '2021-05-28',
        certificationCenter: 'Université de Lyon',
        isPublished: true,
        pixScore: 654,
        status: 'validated',
        commentForCandidate: 'Comment for candidate',
        verificationCode: 'P-122344',
      });
      this.set('certification', certification);

      const screen = await renderScreen(
        hbs`<Certifications::UserCertificationsDetailHeader @certification={{this.certification}} />`,
      );

      // when
      await click(screen.getByRole('button', { name: t('pages.certificate.actions.download') }));

      // then
      assert.ok(screen.getByText('Une erreur est survenue. Veuillez recommencer ou contacter le support.'));
    });
  });
});
