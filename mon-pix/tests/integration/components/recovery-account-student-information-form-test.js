import { expect } from 'chai';
import { describe, it } from 'mocha';
import Service from '@ember/service';
import { render, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { contains } from '../../helpers/contains';
import { fillInByLabel } from '../../helpers/fill-in-by-label';
import { clickByLabel } from '../../helpers/click-by-label';
import sinon from 'sinon';

describe('Integration | Component | recovery-account-student-information-form', function() {
  setupIntlRenderingTest();

  it('should render a recovery account student information form', async function() {
    // given / when
    await render(hbs`<RecoveryAccountStudentInformationForm />`);

    // then
    expect(contains(this.intl.t('pages.recovery-account-after-leaving-sco.student-information.title'))).to.exist;
    expect(contains(this.intl.t('pages.recovery-account-after-leaving-sco.student-information.subtitle.text'))).to.exist;
    expect(contains(this.intl.t('pages.recovery-account-after-leaving-sco.student-information.subtitle.link'))).to.exist;
    expect(contains(this.intl.t('common.form.mandatory-all-fields'))).to.exist;
  });

  it('should call queryRecord store method', async function() {
    // given
    const ine = '0123456789A';
    const lastName = 'Lecol';
    const firstName = 'Manuela';
    const dayOfBirth = 20;
    const monthOfBirth = 5;
    const yearOfBirth = 2000;

    const queryRecordStub = sinon.stub();
    class StoreStubService extends Service {
      queryRecord = queryRecordStub;
    }
    this.owner.register('service:store', StoreStubService);

    await render(hbs`<RecoveryAccountStudentInformationForm />`);

    // when
    await fillInByLabel(this.intl.t('pages.recovery-account-after-leaving-sco.student-information.form.ine'), ine);
    await fillInByLabel(this.intl.t('pages.recovery-account-after-leaving-sco.student-information.form.last-name'), lastName);
    await fillInByLabel(this.intl.t('pages.recovery-account-after-leaving-sco.student-information.form.first-name'), firstName);
    await fillIn('#dayOfBirth', dayOfBirth);
    await fillIn('#monthOfBirth', monthOfBirth);
    await fillIn('#yearOfBirth', yearOfBirth);
    await clickByLabel(this.intl.t('pages.recovery-account-after-leaving-sco.student-information.form.submit'));

    // then
    sinon.assert.calledWithExactly(queryRecordStub, 'user', { ine, lastName, firstName, birthdate: '2000-5-20' });
  });

});
