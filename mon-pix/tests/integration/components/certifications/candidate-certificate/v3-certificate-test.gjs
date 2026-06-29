import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import V3Certificate from 'mon-pix/components/certifications/candidate-certificate/v3-certificate';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | Candidate certificate | v3-certificate', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the global level label is pre-beginner', function () {
    test('it displays certificate information without resultCompetenceTree', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Bon',
        certificationDate: new Date('2018-02-15T15:15:52Z'),
        deliveredAt: new Date('2018-02-17T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        pixScore: 31,
        maxReachableLevelOnCertificationDate: new Date('2018-02-15T15:15:52Z'),
      });

      // when
      const screen = await render(<template><V3Certificate @certificate={{certification}} /></template>);

      // then
      assert
        .dom(
          screen.getByRole('heading', { level: 2, name: t('pages.certificate.global.explanation.pre-beginner-level') }),
        )
        .exists();
      assert
        .dom(screen.queryByRole('heading', { name: t('pages.certificate.details.competences.title') }))
        .doesNotExist();
      assert
        .dom(screen.queryByRole('tablist', { name: t('pages.certificate.details.competences.title') }))
        .doesNotExist();
    });
  });

  module('when the global level label is not pre-beginner', function () {
    test('it displays certificate information with resultCompetenceTree', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Bon',
        certificationDate: new Date('2018-02-15T15:15:52Z'),
        deliveredAt: new Date('2018-02-17T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        pixScore: 654,
        resultCompetenceTree: store.createRecord('result-competence-tree'),
        maxReachableLevelOnCertificationDate: new Date('2018-02-15T15:15:52Z'),
        globalLevelLabel: 'Expert 1',
      });

      // when
      const screen = await render(<template><V3Certificate @certificate={{certification}} /></template>);

      // then
      assert.dom(screen.getByRole('heading', { level: 2, name: t('pages.certificate.congratulations') })).exists();
      assert
        .dom(
          screen.getByText(
            t('pages.certificate.global.explanation.default', { globalLevelLabel: certification.globalLevelLabel }),
          ),
        )
        .exists();
      const globalLevelLabels = screen.getAllByText(certification.globalLevelLabel);
      assert.strictEqual(globalLevelLabels.length, 2);
    });
  });

  module('when the candidate acquired a complementary certification (clea only)', function () {
    test('it displays complementary certification information', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        birthplace: 'Paris',
        firstName: 'Jean',
        lastName: 'Bon',
        certificationDate: new Date('2018-02-15T15:15:52Z'),
        deliveredAt: new Date('2018-02-17T15:15:52Z'),
        certificationCenter: 'Université de Lyon',
        pixScore: 31,
        maxReachableLevelOnCertificationDate: new Date('2018-02-15T15:15:52Z'),
        acquiredComplementaryCertification: 'http://example.com/clea.svg',
      });

      // when
      const screen = await render(<template><V3Certificate @certificate={{certification}} /></template>);

      // then
      assert.dom(screen.getByRole('heading', { level: 2, name: t('pages.certificate.complementary.title') })).exists();
      assert.dom(screen.getByText(t('pages.certificate.complementary.clea'))).exists();
      assert
        .dom(screen.getByRole('img', { name: t('pages.certificate.complementary.alternative') }))
        .hasAttribute('src', 'http://example.com/clea.svg');
    });
  });
});
