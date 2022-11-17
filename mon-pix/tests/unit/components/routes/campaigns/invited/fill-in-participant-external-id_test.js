import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';
import createComponent from '../../../../../helpers/create-glimmer-component';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

describe('Unit | Component | routes/campaigns/invited/fill-in-participant-external-id', function () {
  setupIntlRenderingTest();

  const campaign = {
    id: 1243,
    code: 'CODECAMPAIGN',
    idPixLabel: 'Identifiant professionnel',
  };
  const participantExternalId = 'matricule123';

  let component;
  let onSubmitStub;
  let onCancelStub;
  let eventStub;

  beforeEach(function () {
    onSubmitStub = sinon.stub();
    onCancelStub = sinon.stub();
    eventStub = { preventDefault: sinon.stub() };
    component = createComponent('component:routes/campaigns/invited/fill-in-participant-external-id', {
      campaign,
      onSubmit: onSubmitStub,
      onCancel: onCancelStub,
    });
  });

  describe('#submit', function () {
    it('should succeed when participantExternalId is correct', async function () {
      // given
      component.participantExternalId = participantExternalId;

      // when
      await component.actions.submit.call(component, eventStub);

      // then
      sinon.assert.calledWith(onSubmitStub, participantExternalId);
      sinon.assert.called(eventStub.preventDefault);
    });

    it('should display error when participant external id is empty', async function () {
      // given
      component.participantExternalId = '';

      // when
      await component.actions.submit.call(component, eventStub);

      // then
      expect(component.errorMessage).to.equal(`Merci de renseigner votre ${component.args.campaign.idPixLabel}.`);
    });

    it('should display error when participant external id exceed 255 characters', async function () {
      // given
      component.participantExternalId =
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

      // when
      await component.actions.submit.call(component, eventStub);

      // then
      expect(component.errorMessage).to.equal(
        `Votre ${component.args.campaign.idPixLabel} ne doit pas dépasser les 255 caractères.`
      );
    });
  });

  describe('#cancel', function () {
    it('should abort and call its parent method', async function () {
      // when
      await component.actions.cancel.call(component);

      // then
      sinon.assert.called(onCancelStub);
    });
  });
});
