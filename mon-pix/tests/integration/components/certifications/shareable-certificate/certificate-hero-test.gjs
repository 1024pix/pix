import { render } from '@1024pix/ember-testing-library';
import CertificateHero from 'mon-pix/components/certifications/shareable-certificate/certificate-hero';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | Shareable certificate | certificate-hero', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the certificate is displayed to a third party', function () {
    test('it displays the valid status, the sub-title, the candidate information and the given blocks', async function (assert) {
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
      });
      const stepperContent = 'Étapes';
      const scoreContent = 'Score';

      // when
      const screen = await render(
        <template>
          <CertificateHero @certificate={{certification}} @subTitle="Le candidat a obtenu la certification">
            <:stepper><p>{{stepperContent}}</p></:stepper>
            <:score><p>{{scoreContent}}</p></:score>
          </CertificateHero>
        </template>,
      );

      // then
      assert
        .dom(
          screen.getByRole('heading', {
            level: 2,
            name: `${t('pages.certificate.valid-status')} Le candidat a obtenu la certification`,
          }),
        )
        .exists();
      assert.strictEqual(screen.getAllByText(t('pages.certificate.valid-status')).length, 2);
      assert.dom(screen.getByText(`${t('pages.certificate.candidate')} Jean Bon`)).exists();
      assert.dom(screen.getByText('Université de Lyon')).exists();
      assert.dom(screen.getByText('15/02/2018')).exists();
      assert.dom(screen.getByText('17/02/2018')).exists();
      assert.dom(screen.getByText(stepperContent)).exists();
      assert.dom(screen.getByText(scoreContent)).exists();
      assert.dom('.download-pdf').doesNotExist();
    });
  });

  module('when the certificate is displayed to its owner', function () {
    test('it displays the congratulations title and the download pdf section', async function (assert) {
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
        verificationCode: 'P-ABC123',
      });

      // when
      const screen = await render(
        <template>
          <CertificateHero
            @certificate={{certification}}
            @subTitle="Vous avez obtenu la certification"
            @isUserCertificate={{true}}
          />
        </template>,
      );

      // then
      assert
        .dom(
          screen.getByRole('heading', {
            level: 2,
            name: `${t('pages.certificate.congratulations')} Vous avez obtenu la certification`,
          }),
        )
        .exists();
      assert.dom(screen.queryByText(t('pages.certificate.valid-status'))).doesNotExist();
      assert.dom('.download-pdf').exists();
    });
  });
});
