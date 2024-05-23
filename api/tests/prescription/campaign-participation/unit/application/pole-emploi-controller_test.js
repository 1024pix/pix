import { poleEmploiController } from '../../../../../src/prescription/campaign-participation/application/pole-emploi-controller.js';
import { usecases } from '../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { UnprocessableEntityError } from '../../../../../src/shared/application/http-errors.js';
import { catchErr, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | pole-emploi-controller', function () {
  describe('#getSendings', function () {
    let curseur, decodedCurseur, badCurseur, sending, poleEmploiService;

    beforeEach(function () {
      curseur = Symbol('curseur');
      decodedCurseur = Symbol('decoded curseur');
      badCurseur = Symbol('badCurseur');
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

      it('should throw UnprocessableEntityError if curseur is not valid', async function () {
        // given
        const request = { query: { curseur: badCurseur } };

        poleEmploiService.decodeCursor.withArgs(badCurseur).rejects(new SyntaxError());
        // when
        const error = await catchErr(poleEmploiController.getSendings)(request, hFake, { poleEmploiService });
        //then
        expect(error).to.be.an.instanceof(UnprocessableEntityError);
        expect(error.message).to.equal('The provided cursor is unreadable');
        expect(error.status).to.equal(422);
      });

      it('should throw Error if an other error is catched', async function () {
        // given
        const curseur = Symbol('curseur');
        const request = { query: { curseur } };

        poleEmploiService.decodeCursor.withArgs(curseur).resolves();
        sinon.stub(usecases, 'getPoleEmploiSendings').rejects();

        // when
        const error = await catchErr(poleEmploiController.getSendings)(request, hFake, { poleEmploiService });

        //then
        expect(error).to.throw;
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
