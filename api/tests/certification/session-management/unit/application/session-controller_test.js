import sinon from 'sinon';

import { sessionController } from '../../../../../src/certification/session-management/application/session-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { getI18n } from '../../../../../src/shared/infrastructure/i18n/i18n.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Certification | Session Management | Unit | Application | Controller | Session', function () {
  let request;
  const userId = 274939274;

  describe('#get', function () {
    const sessionId = 123;

    beforeEach(function () {
      sinon.stub(usecases, 'getSession');

      request = {
        auth: { credentials: { userId } },
        params: { sessionId },
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
          .withArgs({ session: foundSession, hasSomeCleaAcquired: false })
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
        params: { sessionId },
      };
    });

    context('when session exists', function () {
      it('should reply serialized session informations', async function () {
        // given
        const jurySessionSerializer = { serialize: sinon.stub() };
        const foundJurySession = Symbol('foundSession');
        const serializedJurySession = Symbol('serializedSession');
        usecases.getJurySession.withArgs({ sessionId }).resolves(foundJurySession);
        jurySessionSerializer.serialize.withArgs(foundJurySession).resolves(serializedJurySession);

        // when
        const response = await sessionController.getJurySession(request, hFake, { jurySessionSerializer });

        // then
        expect(response).to.deep.equal(serializedJurySession);
      });
    });
  });

  describe('#getJuryCertificationSummaries ', function () {
    it('should return jury certification summaries', async function () {
      // given
      const i18n = getI18n();
      const sessionId = 1;
      const juryCertificationSummaries = { juryCertificationSummaries: 'tactac', pagination: {} };
      const juryCertificationSummariesJSONAPI = 'someSummariesJSONApi';
      const page = { number: 3, size: 30 };
      const pagination = Symbol('pagination');

      const request = {
        i18n,
        params: { sessionId },
        query: { page: { size: 30, number: 3 } },
        auth: {
          credentials: {
            userId,
          },
        },
      };
      const juryCertificationSummaryRepository = {
        findBySessionIdPaginated: sinon.stub(),
      };
      juryCertificationSummaryRepository.findBySessionIdPaginated
        .withArgs({ sessionId, page })
        .resolves({ juryCertificationSummaries, pagination });
      const juryCertificationSummarySerializer = {
        serialize: sinon.stub(),
      };
      juryCertificationSummarySerializer.serialize
        .withArgs(juryCertificationSummaries)
        .returns(juryCertificationSummariesJSONAPI);

      // when
      const response = await sessionController.getJuryCertificationSummaries(request, hFake, {
        juryCertificationSummaryRepository,
        juryCertificationSummarySerializer,
      });

      // then
      expect(response).to.deep.equal(juryCertificationSummariesJSONAPI);
    });
  });
});
