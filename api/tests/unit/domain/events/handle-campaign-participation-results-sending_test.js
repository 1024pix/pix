const { catchErr, expect, sinon } = require('../../../test-helper');
const CampaignParticipationResultsShared = require('../../../../lib/domain/events/CampaignParticipationResultsShared');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const { handleCampaignParticipationResultsSending } = require('../../../../lib/domain/events')._forTestOnly.handlers;

describe('Unit | Domain | Events | handle-campaign-participation-results-sending', () => {
  let event;

  const dependencies = {
    organizationRepository,
  };

  const expectedResults = '{' +
    '"campagne":{' +
      '"nom":"Campagne Pôle Emploi",' +
      '"dateDebut":"2020-01-01T00:00:00.000Z",' +
      '"dateFin":"2020-02-01T00:00:00.000Z",' +
      '"type":"EVALUATION",' +
      '"idCampagne":11223344,' +
      '"codeCampagne":"CODEPE123",' +
      '"urlCampagne":"https://app.pix.fr/campagnes/CODEPE123",' +
      '"nomOrganisme":"Pix",' +
      '"typeOrganisme":"externe"' +
    '},' +
    '"individu":{' +
      '"nom":"Bonneau",' +
      '"prenom":"Jean"' +
    '},' +
    '"test":{' +
      '"etat":4,' +
      '"progression":100,' +
      '"typeTest":"DI",' +
      '"referenceExterne":55667788,' +
      '"dateDebut":"2020-01-02T00:00:00.000Z",' +
      '"dateProgression":"2020-01-03T00:00:00.000Z",' +
      '"dateValidation":"2020-01-03T00:00:00.000Z",' +
      '"evaluationCible":62.47,' +
      '"uniteEvaluation":"A",' +
      '"elementsEvalues":[{' +
        '"libelle":"Gérer des données",' +
        '"categorie":"competence",' +
        '"type":"competence Pix",' +
        '"domaineRattachement":"Information et données",' +
        '"nbSousElements":3,' +
        '"evaluation":{' +
          '"scoreObtenu":66.6,' +
          '"uniteScore":"A",' +
          '"nbSousElementValide":2' +
        '}' +
      '}' +
      ',' +
      '{' +
        '"libelle":"Gérer des données 2",' +
        '"categorie":"competence 2",' +
        '"type":"competence Pix 2",' +
        '"domaineRattachement":"Information et données",' +
        '"nbSousElements":5,' +
        '"evaluation":{' +
          '"scoreObtenu":60,' +
          '"uniteScore":"B",' +
          '"nbSousElementValide":3' +
        '}' +
      '}]' +
    '}' +
  '}';

  it('fails when event is not of correct type', async () => {
    // given
    const event = 'not an event of the correct type';
    // when / then
    const error = await catchErr(handleCampaignParticipationResultsSending)(
      { event, ...dependencies },
    );

    // then
    expect(error).not.to.be.null;
  });

  context('#handleCampaignParticipationResultsSending', () => {
    const campaignParticipationId = Symbol('campaignParticipationId');
    const campaignId = Symbol('campaignId');
    const userId = Symbol('userId');
    const organizationId = Symbol('organizationId');

    context('when campaign is of type ASSESSMENT and organization is Pole Emploi', () => {
      beforeEach(() => {
        event = new CampaignParticipationResultsShared({
          campaignId,
          isAssessment: true,
          campaignParticipationId,
          userId,
          organizationId,
        });

        sinon.stub(organizationRepository, 'get').withArgs(organizationId).resolves({ isPoleEmploi: true });
        sinon.stub(console, 'log').resolves();
      });

      it('it should console.log results', async () => {
        // when
        await handleCampaignParticipationResultsSending({
          event, ...dependencies,
        });

        // then
        expect(console.log).to.have.been.calledOnce;
        const results = console.log.firstCall.args[0];
        expect(results).to.deep.equal(expectedResults);
      });
    });

    context('when campaign is of type ASSESSMENT but organization is not Pole Emploi', () => {
      beforeEach(() => {
        event = new CampaignParticipationResultsShared({
          campaignId,
          isAssessment: true,
          campaignParticipationId,
          userId,
          organizationId,
        });

        sinon.stub(organizationRepository, 'get').withArgs(organizationId).resolves({ isPoleEmploi: false });
        sinon.stub(console, 'log').resolves();
      });

      it('it should not console.log results', async () => {
        // when
        await handleCampaignParticipationResultsSending({
          event, ...dependencies,
        });

        // then
        sinon.assert.notCalled(console.log);
      });
    });

    context('when organization is Pole Emploi but campaign is of type PROFILES_COLLECTION', () => {
      beforeEach(() => {
        event = new CampaignParticipationResultsShared({
          campaignId,
          isAssessment: false,
          campaignParticipationId,
          userId,
          organizationId,
        });

        sinon.stub(organizationRepository, 'get').withArgs(organizationId).resolves({ isPoleEmploi: true });
        sinon.stub(console, 'log').resolves();
      });

      it('it should not console.log results', async () => {
        // when
        await handleCampaignParticipationResultsSending({
          event, ...dependencies,
        });

        // then
        sinon.assert.notCalled(console.log);
      });
    });
  });
});
