const { expect, sinon, hFake } = require('../../../test-helper');

const poleEmploiController = require('../../../../lib/application/pole-emplois/pole-emploi-controller');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | pole-emplois-controller', () => {

  describe('#getSendings', () => {
    context('when there is a cursor in the url', function() {
      it('should return the pole emploi sending', async () => {
        // given
        const request = { query: { curseur: 'azefvbjljhgrEDJNH' } };
        const sending = [{
          idEnvoi: 456,
          dateEnvoi: new Date('2021-05-01'),
          resultat: {
            campagne: {
              nom: 'Campagne PE',
              dateDebut: '2020-08-01T00:00:00.000Z',
              type: 'EVALUATION',
              codeCampagne: 'POLEEMPLOI123',
              urlCampagne: 'https://app.pix.fr/campagnes/POLEEMPLOI123',
              nomOrganisme: 'Pix',
              typeOrganisme: 'externe' },
            individu: {
              nom: 'Kamado',
              prenom: 'Tanjiro',
              idPoleEmploi: 'externalUserId' },
            test: {
              etat: 2,
              typeTest: 'DI',
              referenceExterne: 123456,
              dateDebut: '2020-09-01T00:00:00.000Z',
              elementsEvalues: [] } } }];
        sinon.stub(usecases, 'getPoleEmploiSendings').withArgs({ cursor: request.query.curseur }).resolves(sending);

        // when
        await poleEmploiController.getSendings(request, hFake);

        //then
        expect(usecases.getPoleEmploiSendings).have.been.calledWith({ cursor: 'azefvbjljhgrEDJNH' });
      });
    });
  });
});
