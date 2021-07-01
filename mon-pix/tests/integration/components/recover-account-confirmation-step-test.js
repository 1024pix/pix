import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { contains } from '../../helpers/contains';
import { clickByLabel } from '../../helpers/click-by-label';
import sinon from 'sinon';

describe('Integration | Component | recover-account-confirmation-step', function() {
  setupRenderingTest();

  it('should render account recovery confirmation step', async function() {
    // given
    const studentInformationForAccountRecovery = EmberObject.create({
      firstName: 'Philippe',
      lastName: 'Auguste',
      username: 'Philippe.auguste2312',
      email: 'philippe.auguste@example.net',
      latestOrganizationName: 'Collège George-Besse, Loches',
    });
    this.set('studentInformationForAccountRecovery', studentInformationForAccountRecovery);

    // when
    await render(hbs`<RecoverAccountConfirmationStep
      @studentInformationForAccountRecovery={{this.studentInformationForAccountRecovery}}
    />`);

    // then
    expect(contains('Bonne nouvelle Philippe !')).to.exist;
    expect(contains('Nous avons retrouvé votre compte :')).to.exist;
    expect(contains('Si vous constatez une erreur ou si ces données ne sont pas les votres, contactez le support.')).to.exist;
    expect(contains('Auguste'));
    expect(contains('Philippe'));
    expect(contains('Philippe.auguste2312'));
    expect(contains('Collège George-Besse, Loches'));
    expect(contains('En confirmant, j’atteste sur l’honneur que le compte associé à ces données m’appartient et j’accepte que Pix supprime le lien vers tous les établissements auquels je suis rattaché.')).to.exist;
  });

  it('should be possible to cancel the account recovery process', async function() {
    // given
    const studentInformationForAccountRecovery = EmberObject.create({
      firstName: 'Philippe',
      lastName: 'Auguste',
      username: 'Philippe.auguste2312',
      email: 'philippe.auguste@example.net',
      latestOrganizationName: 'Collège George-Besse, Loches',
    });
    this.set('studentInformationForAccountRecovery', studentInformationForAccountRecovery);
    const cancelAccountRecovery = sinon.stub();
    this.set('cancelAccountRecovery', cancelAccountRecovery);

    // when
    await render(hbs`<RecoverAccountConfirmationStep
      @studentInformationForAccountRecovery={{this.studentInformationForAccountRecovery}}
      @cancelAccountRecovery={{this.cancelAccountRecovery}}
    />`);
    await clickByLabel('Annuler');

    // then
    sinon.assert.calledOnce(cancelAccountRecovery);
  });

  it('should be possible to continue the account recovery process', async function() {
    // given
    const studentInformationForAccountRecovery = EmberObject.create({
      firstName: 'Philippe',
      lastName: 'Auguste',
      username: 'Philippe.auguste2312',
      email: 'philippe.auguste@example.net',
      latestOrganizationName: 'Collège George-Besse, Loches',
    });
    this.set('studentInformationForAccountRecovery', studentInformationForAccountRecovery);
    const continueAccountRecovery = sinon.stub();
    this.set('continueAccountRecovery', continueAccountRecovery);

    // when
    await render(hbs`<RecoverAccountConfirmationStep
      @studentInformationForAccountRecovery={{this.studentInformationForAccountRecovery}}
      @continueAccountRecovery={{this.continueAccountRecovery}}
    />`);
    await clickByLabel('Je confirme');

    // then
    sinon.assert.calledOnce(continueAccountRecovery);
  });
});
