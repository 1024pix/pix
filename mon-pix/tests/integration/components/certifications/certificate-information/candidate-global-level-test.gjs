import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import CandidateGlobalLevel from 'mon-pix/components/certifications/certificate-information/candidate-global-level';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | Certificate information | candidate global level', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the global level label is pre-beginner', function () {
    test('it does not display global level information', async function (assert) {
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
        pixScore: 12,
        maxReachableLevelOnCertificationDate: new Date('2018-02-15T15:15:52Z'),
      });

      // when
      const screen = await render(<template><CandidateGlobalLevel @certificate={{certification}} /></template>);

      // then
      assert
        .dom(screen.queryByRole('heading', { name: t('pages.certificate.global.labels.level'), level: 2 }))
        .doesNotExist();
      assert
        .dom(
          screen.getByRole('progressbar', {
            name: t('pages.certificate.global.progress-bar-explanation.pre-beginner-level'),
          }),
        )
        .exists();
    });
  });

  module('when the global level label is not pre-beginner', function () {
    test('it displays global level information', async function (assert) {
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
        pixScore: 840,
        resultCompetenceTree: store.createRecord('result-competence-tree'),
        maxReachableLevelOnCertificationDate: new Date('2018-02-15T15:15:52Z'),
        globalLevelLabel: 'Expert 1',
        globalDescriptionLabel: 'Vous êtes capable de tout.',
        globalSummaryLabel: 'Expert de tous les domaines, Pix vous dit bravo !',
        level: '7',
      });

      // when
      const screen = await render(<template><CandidateGlobalLevel @certificate={{certification}} /></template>);

      // then
      assert.dom(screen.getByRole('heading', { name: t('pages.certificate.global.labels.level'), level: 2 })).exists();
      assert.dom(screen.getByText(certification.globalLevelLabel)).exists();
      assert.dom(screen.getByText(certification.globalDescriptionLabel)).exists();
      assert.dom(screen.getByText(certification.globalSummaryLabel)).exists();
      assert
        .dom(
          screen.getByRole('progressbar', {
            name: t('pages.certificate.global.progress-bar-explanation.default', {
              level: certification.level,
              globalLevelLabel: certification.globalLevelLabel,
            }),
          }),
        )
        .exists();
    });
  });
});
