import { sessionController } from '../../../../../src/certification/session-management/application/session-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | sessionController', function () {
  let request;
  const userId = 274939274;

  describe('#get', function () {
    const sessionId = 123;

    beforeEach(function () {
      sinon.stub(usecases, 'getSession');

      request = {
        auth: { credentials: { userId } },
        params: {
          id: sessionId,
        },
      };
    });

    context('when session exists', function () {
      it('should reply serialized session informations', async function () {
        // given
        const sessionSerializer = { serialize: sinon.stub() };
        const foundSession = Symbol('foundSession');
        const serializedSession = Symbol('serializedSession');
        usecases.getSession.withArgs({ sessionId }).resolves({ session: foundSession, hasSomeCleaAcquired: false });
        sessionSerializer.serialize
          .withArgs({ session: foundSession, hasSupervisorAccess: undefined, hasSomeCleaAcquired: false })
          .returns(serializedSession);

        // when
        const response = await sessionController.get(request, hFake, {
          sessionSerializer,
        });

        // then
        expect(response).to.deep.equal(serializedSession);
      });
    });
  });

  describe('#findPaginatedFilteredJurySessions', function () {
    it('should return the serialized jurySessions', async function () {
      // given
      const sessionValidator = { validateAndNormalizeFilters: sinon.stub() };
      const jurySessionRepository = { findPaginatedFiltered: sinon.stub() };
      const jurySessionSerializer = { serializeForPaginatedList: sinon.stub() };
      const filter = { filter1: ' filter1ToTrim', filter2: 'filter2' };
      const normalizedFilters = 'normalizedFilters';
      const page = 'somePageConfiguration';
      const jurySessionsForPaginatedList = Symbol('jurySessionsForPaginatedList');
      const serializedJurySessionsForPaginatedList = Symbol('serializedJurySessionsForPaginatedList');
      const request = { query: { filter, page } };
      sessionValidator.validateAndNormalizeFilters.withArgs(filter).returns(normalizedFilters);
      jurySessionRepository.findPaginatedFiltered
        .withArgs({ filters: normalizedFilters, page })
        .resolves(jurySessionsForPaginatedList);
      jurySessionSerializer.serializeForPaginatedList
        .withArgs(jurySessionsForPaginatedList)
        .returns(serializedJurySessionsForPaginatedList);

      // when
      const result = await sessionController.findPaginatedFilteredJurySessions(request, hFake, {
        sessionValidator,
        jurySessionRepository,
        jurySessionSerializer,
      });

      // then
      expect(result).to.equal(serializedJurySessionsForPaginatedList);
    });
  });

  describe('#getJurySession', function () {
    const sessionId = 123;

    beforeEach(function () {
      sinon.stub(usecases, 'getJurySession');

      request = {
        auth: { credentials: { userId } },
        params: {
          id: sessionId,
        },
      };
    });

    context('when session exists', function () {
      it('should reply serialized session informations', async function () {
        // given
        const jurySessionSerializer = { serialize: sinon.stub() };
        const foundJurySession = Symbol('foundSession');
        const serializedJurySession = Symbol('serializedSession');
        const hasSupervisorAccess = true;
        usecases.getJurySession
          .withArgs({ sessionId })
          .resolves({ jurySession: foundJurySession, hasSupervisorAccess });
        jurySessionSerializer.serialize.withArgs(foundJurySession, hasSupervisorAccess).resolves(serializedJurySession);

        // when
        const response = await sessionController.getJurySession(request, hFake, { jurySessionSerializer });

        // then
        expect(response).to.deep.equal(serializedJurySession);
      });
    });
  });
});
