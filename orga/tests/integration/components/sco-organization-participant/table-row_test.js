import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import sinon from 'sinon';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | ScoOrganizationParticipant::TableRow', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when hideCertifiableDate is true', function () {
    test('it should not display certifiableAt date', async function (assert) {
      // given
      const certifiableDate = '10/10/2023';
      this.set('noop', sinon.stub());
      const student = {
        firstName: 'Jean',
        lastName: 'Bon',
        birthdate: '2020/01/01',
        division: '3A',
        authenticationMethods: [],
        participationCount: 1,
        isCertifiable: true,
        certifiableAt: new Date(certifiableDate),
      };
      this.set('student', student);
      this.set('hasComputeOrganizationLearnerCertificabilityEnabled', true);

      // when
      const screen = await render(
        hbs`<ScoOrganizationParticipant::TableRow
  @showCheckbox={{this.noop}}
  @student={{this.student}}
  @isStudentSelected={{this.noop}}
  @openAuthenticationMethodModal={{this.noop}}
  @onToggleStudent={{this.noop}}
  @onClickLearner={{this.noop}}
  @hideCertifiableDate={{this.hasComputeOrganizationLearnerCertificabilityEnabled}}
/>`,
      );

      // then
      assert.dom(screen.queryByText(certifiableDate)).doesNotExist();
    });
  });

  module('when hasComputeOrganizationLearnerCertificabilityEnabled is false', function () {
    test('it display certifiableAt date', async function (assert) {
      // given
      const certifiableDate = '10/10/2023';
      this.set('noop', sinon.stub());
      const student = {
        firstName: 'Jean',
        lastName: 'Bon',
        birthdate: '2020/01/01',
        division: '3A',
        authenticationMethods: [],
        participationCount: 1,
        isCertifiable: true,
        certifiableAt: new Date(certifiableDate),
      };
      this.set('student', student);
      this.set('hasComputeOrganizationLearnerCertificabilityEnabled', false);

      // when
      const screen = await render(
        hbs`<ScoOrganizationParticipant::TableRow
  @showCheckbox={{this.noop}}
  @student={{this.student}}
  @isStudentSelected={{this.noop}}
  @openAuthenticationMethodModal={{this.noop}}
  @onToggleStudent={{this.noop}}
  @onClickLearner={{this.noop}}
  @hideCertifiableDate={{this.hasComputeOrganizationLearnerCertificabilityEnabled}}
/>`,
      );

      // then
      assert.dom(screen.getByText(certifiableDate)).exists();
    });
  });
});
