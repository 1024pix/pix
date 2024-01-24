import { expect, sinon, hFake } from '../../../test-helper.js';
import { poleEmploiController } from '../../../../lib/application/pole-emploi/pole-emploi-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';

describe('Unit | Controller | pole-emploi-controller', function () {
  describe('#getSendings', function () {
    let curseur, decodedCurseur, sending, poleEmploiService;
    beforeEach(function () {
      curseur = Symbol('curseur');
      decodedCurseur = Symbol('decoded curseur');
      sending = [{ idEnvoi: 1 }];
      poleEmploiService = { decodeCursor: sinon.stub() };
    });
    context('when there is a cursor in the url', function () {
      it('should return the pole emploi sending', async function () {
        // given
        const curseur = Symbol('curseur');
        const decodedCurseur = Symbol('decoded curseur');
        const request = { query: { curseur } };
        sinon.stub(usecases, 'getPoleEmploiSendings').resolves(sending);
        poleEmploiService.decodeCursor.withArgs(curseur).resolves(decodedCurseur);

        // when
        await poleEmploiController.getSendings(request, hFake, { poleEmploiService });

        //then
        expect(usecases.getPoleEmploiSendings).have.been.calledWithExactly({
          cursorData: decodedCurseur,
          filters: {},
        });
      });
    });
    context('when there are filters', function () {
      context("when enErreur is 'false'", function () {
        it('should return the pole emploi sending', async function () {
          // given
          const request = { query: { curseur, enErreur: false } };
          const sending = [{ idEnvoi: 456 }];
          poleEmploiService.decodeCursor.withArgs(curseur).resolves(decodedCurseur);
          sinon.stub(usecases, 'getPoleEmploiSendings').resolves(sending);

          // when
          await poleEmploiController.getSendings(request, hFake, { poleEmploiService });

          //then
          expect(usecases.getPoleEmploiSendings).have.been.calledWithExactly({
            cursorData: decodedCurseur,
            filters: { isSuccessful: true },
          });
        });
      });
      context("when enErreur is 'true'", function () {
        it('should return the pole emploi sending', async function () {
          // given
          const request = { query: { curseur, enErreur: true } };
          const sending = [{ idEnvoi: 456 }];
          poleEmploiService.decodeCursor.withArgs(curseur).resolves(decodedCurseur);
          sinon.stub(usecases, 'getPoleEmploiSendings').resolves(sending);

          // when
          await poleEmploiController.getSendings(request, hFake, { poleEmploiService });

          //then
          expect(usecases.getPoleEmploiSendings).have.been.calledWithExactly({
            cursorData: decodedCurseur,
            filters: { isSuccessful: false },
          });
        });
      });
    });
  });
});
