import { render } from '@1024pix/ember-testing-library';
import HeaderDetails from 'mon-pix/components/certifications/certificate-information/header-details';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubCurrentUserService } from '../../helpers/service-stubs';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | Certificate information | Header details', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when certification is complete', function (hooks) {
    const state = {};
    let screen;
    let store;

    hooks.beforeEach(async function () {
      // given
      stubCurrentUserService(this.owner);
      store = this.owner.lookup('service:store');
      state.certification = store.createRecord('certification', {
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

      // when
      screen = await render(<template><HeaderDetails @certificate={{state.certification}} /></template>);
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

  module('when domain is french', function (hooks) {
    hooks.beforeEach(function () {
      const domainService = this.owner.lookup('service:currentDomain');
      sinon.stub(domainService, 'getExtension').returns('fr');

      stubCurrentUserService(this.owner, { lang: 'fr' });
    });

    module('when certification is delivered after 2022-01-01', function () {
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

        // when
        const screen = await render(<template><HeaderDetails @certificate={{certification}} /></template>);

        // then
        assert.ok(
          screen.getByText(
            'Le certificat Pix est reconnu comme professionnalisant par France compétences à compter d’un score minimal de 120 pix',
          ),
        );
      });
    });

    module('when certification is delivered before 2022-01-01', function () {
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

        // when
        const screen = await render(<template><HeaderDetails @certificate={{certification}} /></template>);

        // then
        assert.notOk(
          screen.queryByText(
            'Le certificat Pix est reconnu comme professionnalisant par France compétences à compter d’un score minimal de 120 pix',
          ),
        );
      });
    });
  });

  module('when domain is not french', function () {
    test('should not display the professionalizing warning', async function (assert) {
      // given
      stubCurrentUserService(this.owner, { lang: 'en' });

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

      // when
      const screen = await render(<template><HeaderDetails @certificate={{certification}} /></template>);

      // then
      assert.notOk(
        screen.queryByText(
          'Le certificat Pix est reconnu comme professionnalisant par France compétences à compter d’un score minimal de 120 pix',
        ),
      );
    });
  });
});
