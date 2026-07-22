import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import V2Certificate from 'mon-pix/components/certifications/candidate-certificate/v2-certificate';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | Candidate certificate | v2-certificate', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays certificate information', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const certification = store.createRecord('certification', {
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
      commentForCandidate: null,
      certifiedBadgeImages: [],
      resultCompetenceTree: store.createRecord('result-competence-tree'),
      maxReachableLevelOnCertificationDate: new Date('2018-02-15T15:15:52Z'),
    });

    // when
    const screen = await render(<template><V2Certificate @model={{certification}} /></template>);

    // then
    assert.dom(screen.getByRole('link', { name: t('pages.certificate.back-link') })).exists();
    assert.dom(screen.getByRole('heading', { level: 1, name: t('pages.certificate.title') })).exists();
  });

  module('#shouldDisplayDetailsSection', function () {
    module('when certification has a commentForCandidate', function () {
      test('it displays candidate comment information', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certification = store.createRecord('certification', {
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
          certifiedBadgeImages: [],
          resultCompetenceTree: store.createRecord('result-competence-tree'),
          maxReachableLevelOnCertificationDate: new Date('2018-02-15T15:15:52Z'),
        });

        // when
        const screen = await render(<template><V2Certificate @model={{certification}} /></template>);

        // then
        assert.dom(screen.getByRole('heading', { level: 2, name: t('pages.certificate.jury-title') })).exists();
        assert.dom(screen.getByText(t('pages.certificate.jury-info'))).exists();
      });
    });

    module('when certification has at least one certified badge image', function () {
      test('it displays complementary certification information', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certification = store.createRecord('certification', {
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
          commentForCandidate: null,
          certifiedBadgeImages: ['/some/img'],
          resultCompetenceTree: store.createRecord('result-competence-tree'),
          maxReachableLevelOnCertificationDate: new Date('2018-02-15T15:15:52Z'),
        });

        // when
        const screen = await render(<template><V2Certificate @model={{certification}} /></template>);

        // then
        assert
          .dom(screen.getByRole('heading', { level: 2, name: t('pages.certificate.complementary.title') }))
          .exists();
      });
    });

    module('when certification has neither commentForCandidate nor certified badge image', function () {
      test('it displays nothing about comment or complementary badge', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const certification = store.createRecord('certification', {
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
          commentForCandidate: null,
          certifiedBadgeImages: [],
          resultCompetenceTree: store.createRecord('result-competence-tree'),
          maxReachableLevelOnCertificationDate: new Date('2018-02-15T15:15:52Z'),
        });

        // when
        const screen = await render(<template><V2Certificate @model={{certification}} /></template>);

        // then
        assert
          .dom(screen.queryByRole('heading', { level: 2, name: t('pages.certificate.complementary.title') }))
          .doesNotExist();
        assert.dom(screen.queryByRole('heading', { level: 2, name: t('pages.certificate.jury-title') })).doesNotExist();
        assert.dom(screen.queryByText(t('pages.certificate.jury-info'))).doesNotExist();
      });
    });
  });
});
