const { expect, sinon, hFake } = require('../../../test-helper');

const poleEmploiController = require('../../../../lib/application/pole-emplois/pole-emploi-controller');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | pole-emplois-controller', () => {

  describe('#getSendings', () => {
    context('when there is a cursor in the url', function() {
      it('should return the pole emploi sending', async () => {
        // given
        const request = { query: { curseur: 'azefvbjljhgrEDJNH' } };
        const sending = [{ idEnvoi: 456 }];
        sinon.stub(usecases, 'getPoleEmploiSendings').resolves(sending);

        // when
        await poleEmploiController.getSendings(request, hFake);

        //then
        expect(usecases.getPoleEmploiSendings).have.been.calledWith({ cursor: 'azefvbjljhgrEDJNH', filters: {} });
      });
    });
    context('when there are filters', function() {
      context('when enErreur is \'false\'', function() {
        it('should return the pole emploi sending', async () => {
          // given
          const request = { query: { curseur: 'azefvbjljhgrEDJNH', enErreur: false } };
          const sending = [{ idEnvoi: 456 }];
          sinon.stub(usecases, 'getPoleEmploiSendings').resolves(sending);

          // when
          await poleEmploiController.getSendings(request, hFake);

          //then
          expect(usecases.getPoleEmploiSendings).have.been.calledWith({ cursor: 'azefvbjljhgrEDJNH', filters: { isSuccessful: true } });
        });
      });
      context('when enErreur is \'true\'', function() {
        it('should return the pole emploi sending', async () => {
          // given
          const request = { query: { curseur: 'azefvbjljhgrEDJNH', enErreur: true } };
          const sending = [{ idEnvoi: 456 }];
          sinon.stub(usecases, 'getPoleEmploiSendings').resolves(sending);

          // when
          await poleEmploiController.getSendings(request, hFake);

          //then
          expect(usecases.getPoleEmploiSendings).have.been.calledWith({ cursor: 'azefvbjljhgrEDJNH', filters: { isSuccessful: false } });
        });
      });
    });
  });
});
