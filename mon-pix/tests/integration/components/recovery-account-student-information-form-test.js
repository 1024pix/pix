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
    expect(contains('Collègiens, lycéens, vous quittez le système scolaire et vous souhaitez récupérer votre accès à Pix')).to.exist;
    expect(contains('Si vous possédez un compte avec une adresse e-mail valide, réinitialisez votre mot de passe ici')).to.exist;
    expect(contains('Tous les champs sont obligatoires.')).to.exist;
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
    await fillInByLabel('INE (Identifiant National Élève)', ine);
    await fillInByLabel('Nom', lastName);
    await fillInByLabel('Prénom', firstName);
    await fillIn('#dayOfBirth', dayOfBirth);
    await fillIn('#monthOfBirth', monthOfBirth);
    await fillIn('#yearOfBirth', yearOfBirth);
    await clickByLabel('Retrouvez-moi !');

    // then
    sinon.assert.calledWithExactly(queryRecordStub, 'user', { ine, lastName, firstName, birthdate: '2000-5-20' });
  });

});
