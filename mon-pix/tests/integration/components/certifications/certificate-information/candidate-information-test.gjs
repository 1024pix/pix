import { render } from '@1024pix/ember-testing-library';
import CandidateInformation from 'mon-pix/components/certifications/certificate-information/candidate-information';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | Certificate information | candidate information', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the global level label is pre-beginner', function () {
    test('it displays candidate information without global level label', async function (assert) {
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
        pixScore: 22,
        maxReachableLevelOnCertificationDate: new Date('2018-02-15T15:15:52Z'),
      });

      // when
      const screen = await render(<template><CandidateInformation @certificate={{certification}} /></template>);

      // then
      assert.dom(screen.getByText(certification.pixScore)).exists();
      assert.dom(screen.queryByTestId('global-level-label-tag')).doesNotExist();
      assert.dom(screen.getByText(`${t('pages.certificate.candidate')} Jean Bon`)).exists();
      assert.dom(screen.getByText(`${t('pages.certificate.certification-center')} Université de Lyon`)).exists();
      assert.dom(screen.getByText(`${t('pages.certificate.certification-date')} 15/02/2018`)).exists();
      assert.dom(screen.getByText(`${t('pages.certificate.delivered-at')} 17/02/2018`)).exists();
    });
  });

  module('when the global level label is not pre-beginner', function () {
    test('it displays candidate information with global level label', async function (assert) {
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
      const screen = await render(<template><CandidateInformation @certificate={{certification}} /></template>);

      // then
      assert.dom(screen.getByText(certification.pixScore)).exists();
      assert.dom(screen.getByText(certification.globalLevelLabel)).exists();
      assert.dom(screen.getByText(`${t('pages.certificate.candidate')} Jean Bon`)).exists();
      assert.dom(screen.getByText(`${t('pages.certificate.certification-center')} Université de Lyon`)).exists();
      assert.dom(screen.getByText(`${t('pages.certificate.certification-date')} 15/02/2018`)).exists();
      assert.dom(screen.getByText(`${t('pages.certificate.delivered-at')} 17/02/2018`)).exists();
    });
  });

  module('when in a shareable context', function () {
    test('it displays the certificate validity with candidate information', async function (assert) {
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
        globalLevelLabel: 'Expert 1',
        certificationFramework: 'CORE',
      });

      // when
      const screen = await render(
        <template><CandidateInformation @certificate={{certification}} @isShareableContext={{true}} /></template>,
      );

      // then
      assert
        .dom(
          screen.getByRole('heading', {
            level: 2,
            name: `${t('pages.certificate.valid-status')} ${t('pages.certificate.obtained-certification.shareable-core')}`,
          }),
        )
        .exists();
      assert.dom(screen.getByText(certification.pixScore)).exists();
      assert.dom(screen.getByText(certification.globalLevelLabel)).exists();
      assert.dom(screen.getByText(`${t('pages.certificate.candidate')} Jean Bon`)).exists();
    });
  });
});
