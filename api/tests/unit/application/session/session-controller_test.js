import { catchErr, domainBuilder, expect, hFake, sinon } from '../../../test-helper.js';
import { sessionController } from '../../../../lib/application/sessions/session-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { UserAlreadyLinkedToCertificationCandidate } from '../../../../lib/domain/events/UserAlreadyLinkedToCertificationCandidate.js';
import { UserLinkedToCertificationCandidate } from '../../../../lib/domain/events/UserLinkedToCertificationCandidate.js';
import { SessionPublicationBatchResult } from '../../../../lib/domain/models/SessionPublicationBatchResult.js';
import { logger } from '../../../../lib/infrastructure/logger.js';
import { SessionPublicationBatchError } from '../../../../lib/application/http-errors.js';
import * as queryParamsUtils from '../../../../lib/infrastructure/utils/query-params-utils.js';
import * as events from '../../../../lib/domain/events/index.js';
import { getI18n } from '../../../tooling/i18n/i18n.js';

describe('Unit | Controller | sessionController', function () {
  let request;
  const userId = 274939274;

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
        const response = await sessionController.get(request, hFake, { sessionSerializer });

        // then
        expect(response).to.deep.equal(serializedSession);
      });
    });
  });

  describe('#update', function () {
    let request, updatedSession, updateSessionArgs;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId: 1 } },
        params: { id: 1 },
        payload: {},
      };

      updatedSession = {
        id: request.params.id,
      };

      updateSessionArgs = {
        userId: request.auth.credentials.userId,
        session: updatedSession,
      };

      sinon.stub(usecases, 'updateSession');
    });

    it('should return the updated session', async function () {
      // given
      const sessionSerializer = { serialize: sinon.stub(), deserialize: sinon.stub() };
      sessionSerializer.deserialize.withArgs(request.payload).returns({});
      usecases.updateSession.withArgs(updateSessionArgs).resolves(updatedSession);
      sessionSerializer.serialize.withArgs({ session: updatedSession }).returns(updatedSession);

      // when
      const response = await sessionController.update(request, hFake, { sessionSerializer });

      // then
      expect(response).to.deep.equal(updatedSession);
    });
  });

  describe('#importCertificationCandidatesFromCandidatesImportSheet', function () {
    const sessionId = 2;
    let request;
    const odsBuffer = 'File Buffer';
    beforeEach(function () {
      // given
      request = {
        params: { id: sessionId },
        payload: odsBuffer,
      };

      sinon.stub(usecases, 'importCertificationCandidatesFromCandidatesImportSheet').resolves();
    });

    it('should call the usecase to import certification candidates', async function () {
      // given
      usecases.importCertificationCandidatesFromCandidatesImportSheet.resolves();

      // when
      await sessionController.importCertificationCandidatesFromCandidatesImportSheet(request);

      // then
      expect(usecases.importCertificationCandidatesFromCandidatesImportSheet).to.have.been.calledWithExactly({
        sessionId,
        odsBuffer,
        i18n: request.i18n,
      });
    });
  });

  describe('#getCertificationCandidates', function () {
    let request;
    const sessionId = 1;
    const certificationCandidates = 'candidates';
    const certificationCandidatesJsonApi = 'candidatesJSONAPI';

    beforeEach(function () {
      // given
      request = {
        params: { id: sessionId },
      };
      sinon
        .stub(usecases, 'getSessionCertificationCandidates')
        .withArgs({ sessionId })
        .resolves(certificationCandidates);
    });

    it('should return certification candidates', async function () {
      // when
      const certificationCandidateSerializer = { serialize: sinon.stub() };
      certificationCandidateSerializer.serialize
        .withArgs(certificationCandidates)
        .returns(certificationCandidatesJsonApi);
      const response = await sessionController.getCertificationCandidates(request, hFake, {
        certificationCandidateSerializer,
      });

      // then
      expect(response).to.deep.equal(certificationCandidatesJsonApi);
    });
  });

  describe('#addCertificationCandidate ', function () {
    let request;
    const sessionId = 1;
    const certificationCandidate = 'candidate';
    const addedCertificationCandidate = 'addedCandidate';
    const certificationCandidateJsonApi = 'addedCandidateJSONApi';
    let complementaryCertification;

    beforeEach(function () {
      // given
      complementaryCertification = Symbol('complementaryCertification');
      request = {
        params: { id: sessionId },
        payload: {
          data: {
            attributes: {
              'complementary-certification': complementaryCertification,
            },
          },
        },
      };
      sinon
        .stub(usecases, 'addCertificationCandidateToSession')
        .withArgs({
          sessionId,
          certificationCandidate,
          complementaryCertification,
        })
        .resolves(addedCertificationCandidate);
    });

    it('should return the added certification candidate', async function () {
      // given
      const certificationCandidateSerializer = {
        serialize: sinon.stub(),
        deserialize: sinon.stub(),
      };
      certificationCandidateSerializer.serialize
        .withArgs(addedCertificationCandidate)
        .returns(certificationCandidateJsonApi);
      certificationCandidateSerializer.deserialize.resolves(certificationCandidate);

      // when
      const response = await sessionController.addCertificationCandidate(request, hFake, {
        certificationCandidateSerializer,
      });

      // then
      expect(response.source).to.equal(certificationCandidateJsonApi);
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('#deleteCertificationCandidate ', function () {
    let request;
    const sessionId = 1;
    const certificationCandidateId = 1;

    beforeEach(function () {
      // given
      request = {
        params: { id: sessionId, certificationCandidateId },
      };
      sinon.stub(usecases, 'deleteUnlinkedCertificationCandidate').withArgs({ certificationCandidateId }).resolves();
    });

    it('should return 204 when deleting successfully the candidate', async function () {
      // when
      const response = await sessionController.deleteCertificationCandidate(request, hFake);

      // then
      expect(response).to.be.null;
    });
  });

  describe('#getJuryCertificationSummaries ', function () {
    it('should return jury certification summaries', async function () {
      // given
      const sessionId = 1;
      const juryCertificationSummaries = { juryCertificationSummaries: 'tactac', pagination: {} };
      const juryCertificationSummariesJSONAPI = 'someSummariesJSONApi';
      const page = { number: 3, size: 30 };
      const pagination = Symbol('pagination');

      const request = {
        params: { id: sessionId },
        query: { 'page[size]': 30, 'page[number]': 3 },
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
        queryParamsUtils,
      });

      // then
      expect(response).to.deep.equal(juryCertificationSummariesJSONAPI);
    });
  });

  describe('#getSessionResultsByRecipientEmail ', function () {
    it('should return csv content and fileName', async function () {
      // given
      const i18n = getI18n();
      const session = { id: 1, date: '2020/01/01', time: '12:00' };
      const dependencies = {
        getSessionCertificationResultsCsv: sinon.stub(),
        tokenService: {
          extractResultRecipientEmailAndSessionId: sinon.stub(),
        },
      };
      dependencies.tokenService.extractResultRecipientEmailAndSessionId
        .withArgs('abcd1234')
        .returns({ sessionId: 1, resultRecipientEmail: 'user@example.net' });

      sinon
        .stub(usecases, 'getSessionResultsByResultRecipientEmail')
        .withArgs({ sessionId: session.id, resultRecipientEmail: 'user@example.net' })
        .resolves({
          session,
          certificationResults: [],
        });

      dependencies.getSessionCertificationResultsCsv
        .withArgs({ session, certificationResults: [], i18n })
        .resolves({ content: 'csv content', filename: '20200101_1200_resultats_session_1.csv' });

      // when
      const response = await sessionController.getSessionResultsByRecipientEmail(
        { i18n, params: { token: 'abcd1234' } },
        hFake,
        dependencies,
      );

      // then
      expect(response.source).to.deep.equal('csv content');
      expect(response.headers['Content-Disposition']).to.equal(
        'attachment; filename=20200101_1200_resultats_session_1.csv',
      );
    });
  });

  describe('#getSessionResultsToDownload ', function () {
    it('should return results to download', async function () {
      // given
      const i18n = getI18n();
      const session = { id: 1, date: '2020/01/01', time: '12:00' };
      const sessionId = session.id;
      const fileName = `20200101_1200_resultats_session_${sessionId}.csv`;
      const certificationResults = [];
      const token = Symbol('a beautiful token');
      const request = {
        i18n,
        params: { id: sessionId, token },
        auth: {
          credentials: { userId },
        },
      };
      const dependencies = {
        getSessionCertificationResultsCsv: sinon.stub(),
        tokenService: {
          extractSessionId: sinon.stub(),
        },
      };
      dependencies.tokenService.extractSessionId.withArgs(token).returns({ sessionId });
      dependencies.getSessionCertificationResultsCsv
        .withArgs({
          session,
          certificationResults,
          i18n: request.i18n,
        })
        .returns({ content: 'csv-string', filename: fileName });
      sinon.stub(usecases, 'getSessionResults').withArgs({ sessionId }).resolves({ session, certificationResults });

      // when
      const response = await sessionController.getSessionResultsToDownload(request, hFake, dependencies);

      // then
      expect(response.source).to.deep.equal('csv-string');
      expect(response.headers['Content-Disposition']).to.equal(`attachment; filename=${fileName}`);
    });
  });

  describe('#getCertificationReports', function () {
    let request;
    const sessionId = 1;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const certificationReports = Symbol('some certification reports');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const serializedCertificationReports = Symbol('some serialized certification reports');

    beforeEach(function () {
      // given
      request = {
        params: { id: sessionId },
      };
      sinon.stub(usecases, 'getSessionCertificationReports').withArgs({ sessionId }).resolves(certificationReports);
    });

    it('should return certification candidates', async function () {
      // given
      const certificationReportSerializer = {
        serialize: sinon.stub(),
      };
      certificationReportSerializer.serialize.withArgs(certificationReports).returns(serializedCertificationReports);

      // when
      const response = await sessionController.getCertificationReports(request, hFake, {
        certificationReportSerializer,
      });

      // then
      expect(response).to.deep.equal(serializedCertificationReports);
    });
  });

  describe('#enrolStudentsToSession', function () {
    let request, studentIds, studentList, serializedCertificationCandidate;
    const sessionId = 1;
    const userId = 2;
    const student1 = { id: 1 };
    const student2 = { id: 2 };
    let dependencies;

    beforeEach(function () {
      studentIds = [student1.id, student2.id];
      studentList = [student1, student2];
      serializedCertificationCandidate = Symbol('CertificationCandidates');

      // given
      request = {
        params: { id: sessionId },
        auth: {
          credentials: {
            userId,
          },
        },
        deserializedPayload: {
          'organization-learner-ids': [student1.id, student2.id],
        },
      };
      const requestResponseUtils = { extractUserIdFromRequest: sinon.stub() };
      sinon.stub(usecases, 'enrolStudentsToSession');
      sinon.stub(usecases, 'getSessionCertificationCandidates');
      const certificationCandidateSerializer = { serialize: sinon.stub() };
      dependencies = {
        requestResponseUtils,
        certificationCandidateSerializer,
      };
    });

    context('when the user has access to session and there organizationLearnerIds are corrects', function () {
      beforeEach(function () {
        dependencies.requestResponseUtils.extractUserIdFromRequest.withArgs(request).returns(userId);
        usecases.enrolStudentsToSession.withArgs({ sessionId, referentId: userId, studentIds }).resolves();
        usecases.getSessionCertificationCandidates.withArgs({ sessionId }).resolves(studentList);
        dependencies.certificationCandidateSerializer.serialize
          .withArgs(studentList)
          .returns(serializedCertificationCandidate);
      });

      it('should return certificationCandidates', async function () {
        // when
        const response = await sessionController.enrolStudentsToSession(request, hFake, dependencies);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.source).to.deep.equal(serializedCertificationCandidate);
      });
    });
  });

  describe('#createCandidateParticipation', function () {
    const sessionId = 1;
    const userId = 2;
    let firstName;
    let lastName;
    let birthdate;
    let linkedCertificationCandidate;
    let serializedCertificationCandidate;
    let dependencies;

    beforeEach(function () {
      // given
      firstName = 'firstName';
      lastName = 'lastName';
      birthdate = Symbol('birthdate');
      linkedCertificationCandidate = Symbol('candidate');
      serializedCertificationCandidate = Symbol('sCandidate');
      const certificationCandidateSerializer = { serialize: sinon.stub() };
      dependencies = {
        certificationCandidateSerializer,
      };
      dependencies.certificationCandidateSerializer.serialize
        .withArgs(linkedCertificationCandidate)
        .returns(serializedCertificationCandidate);
    });

    it('trims the firstname and lastname', async function () {
      // given
      firstName = 'firstName     ';
      lastName = 'lastName    ';
      sinon
        .stub(usecases, 'linkUserToSessionCertificationCandidate')
        .withArgs({
          userId,
          sessionId,
          firstName: 'firstName',
          lastName: 'lastName',
          birthdate,
        })
        .resolves(new UserAlreadyLinkedToCertificationCandidate());
      sinon
        .stub(usecases, 'getCertificationCandidate')
        .withArgs({ userId, sessionId })
        .resolves(linkedCertificationCandidate);
      const request = buildRequest(sessionId, userId, firstName, lastName, birthdate);

      // when
      const response = await sessionController.createCandidateParticipation(request, hFake, dependencies);

      // then
      expect(response).to.equal(serializedCertificationCandidate);
    });

    context('when the participation already exists', function () {
      beforeEach(function () {
        sinon
          .stub(usecases, 'linkUserToSessionCertificationCandidate')
          .withArgs({ userId, sessionId, firstName, lastName, birthdate })
          .resolves(new UserAlreadyLinkedToCertificationCandidate());
        sinon
          .stub(usecases, 'getCertificationCandidate')
          .withArgs({ userId, sessionId })
          .resolves(linkedCertificationCandidate);
      });

      it('should return a certification candidate', async function () {
        // given
        const request = buildRequest(sessionId, userId, firstName, lastName, birthdate);
        // when
        const response = await sessionController.createCandidateParticipation(request, hFake, dependencies);

        // then
        expect(response).to.equals(serializedCertificationCandidate);
      });
    });

    context('when the participation is created', function () {
      beforeEach(function () {
        sinon
          .stub(usecases, 'linkUserToSessionCertificationCandidate')
          .withArgs({ userId, sessionId, firstName, lastName, birthdate })
          .resolves(new UserLinkedToCertificationCandidate());
        sinon
          .stub(usecases, 'getCertificationCandidate')
          .withArgs({ userId, sessionId })
          .resolves(linkedCertificationCandidate);
      });

      it('should return a certification candidate', async function () {
        // given
        const request = buildRequest(sessionId, userId, firstName, lastName, birthdate);

        // when
        const response = await sessionController.createCandidateParticipation(request, hFake, dependencies);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.source).to.equals(serializedCertificationCandidate);
      });
    });
  });

  describe('#finalize', function () {
    it('should call the finalizeSession usecase with correct values', async function () {
      // given
      const sessionId = 1;
      const aCertificationReport = Symbol('a certficication report');
      const updatedSession = Symbol('updatedSession');
      const examinerGlobalComment = 'It was a fine session my dear';
      const hasIncident = true;
      const hasJoiningIssue = true;
      const certificationReports = [
        {
          type: 'certification-reports',
        },
      ];
      const request = {
        params: {
          id: sessionId,
        },
        payload: {
          data: {
            attributes: {
              'examiner-global-comment': examinerGlobalComment,
              'has-incident': hasIncident,
              'has-joining-issue': hasJoiningIssue,
            },
            included: certificationReports,
          },
        },
      };
      const certificationReportSerializer = { deserialize: sinon.stub() };
      certificationReportSerializer.deserialize.resolves(aCertificationReport);
      sinon.stub(usecases, 'finalizeSession').resolves(updatedSession);
      sinon.stub(usecases, 'getSession').resolves(updatedSession);

      // when
      await sessionController.finalize(request, hFake, { certificationReportSerializer, events });

      // then
      expect(usecases.finalizeSession).to.have.been.calledWithExactly({
        sessionId,
        examinerGlobalComment,
        hasIncident,
        hasJoiningIssue,
        certificationReports: [aCertificationReport],
      });
    });
  });

  describe('#publish / #unpublish', function () {
    context('when publishing', function () {
      it('should return the serialized session', async function () {
        // given
        const sessionId = 123;
        const session = Symbol('session');
        const serializedSession = Symbol('serializedSession');
        const i18n = getI18n();
        const sessionSerializer = { serialize: sinon.stub() };
        sinon
          .stub(usecases, 'publishSession')
          .withArgs({
            sessionId,
            i18n,
          })
          .resolves(session);
        sessionSerializer.serialize.withArgs({ session }).resolves(serializedSession);

        // when
        const response = await sessionController.publish(
          {
            i18n,
            params: {
              id: sessionId,
            },
            payload: {
              data: { attributes: { toPublish: true } },
            },
          },
          hFake,
          { sessionSerializer },
        );

        // then
        expect(response).to.equal(serializedSession);
      });
    });

    context('when unpublishing', function () {
      it('should return the serialized session', async function () {
        // given
        const sessionId = 123;
        const session = Symbol('session');
        const serializedSession = Symbol('serializedSession');
        const sessionSerializer = { serialize: sinon.stub() };

        sinon
          .stub(usecases, 'unpublishSession')
          .withArgs({
            sessionId,
          })
          .resolves(session);
        sessionSerializer.serialize.withArgs({ session }).resolves(serializedSession);

        // when
        const response = await sessionController.unpublish(
          {
            params: {
              id: sessionId,
            },
            payload: {
              data: { attributes: { toPublish: false } },
            },
          },
          hFake,
          { sessionSerializer },
        );

        // then
        expect(response).to.equal(serializedSession);
      });
    });
  });

  describe('#publishInBatch', function () {
    it('returns 204 when no error occurred', async function () {
      // given
      const i18n = getI18n();

      const request = {
        i18n,
        payload: {
          data: {
            attributes: {
              ids: ['sessionId1', 'sessionId2'],
            },
          },
        },
      };
      sinon
        .stub(usecases, 'publishSessionsInBatch')
        .withArgs({
          sessionIds: ['sessionId1', 'sessionId2'],
          i18n,
        })
        .resolves(new SessionPublicationBatchResult('batchId'));

      // when
      const response = await sessionController.publishInBatch(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('logs errors when errors occur', async function () {
      // given
      const i18n = getI18n();
      const result = new SessionPublicationBatchResult('batchId');
      result.addPublicationError('sessionId1', new Error('an error'));
      result.addPublicationError('sessionId2', new Error('another error'));

      const request = {
        i18n,
        payload: {
          data: {
            attributes: {
              ids: ['sessionId1', 'sessionId2'],
            },
          },
        },
      };
      sinon.stub(usecases, 'publishSessionsInBatch').resolves(result);
      sinon.stub(logger, 'warn');

      // when
      await catchErr(sessionController.publishInBatch)(request, hFake);

      // then
      expect(logger.warn).to.have.been.calledWithExactly(
        'One or more error occurred when publishing session in batch batchId',
      );

      expect(logger.warn).to.have.been.calledWithExactly(
        {
          batchId: 'batchId',
          sessionId: 'sessionId1',
        },
        'an error',
      );

      expect(logger.warn).to.have.been.calledWithExactly(
        {
          batchId: 'batchId',
          sessionId: 'sessionId2',
        },
        'another error',
      );
    });

    it('returns the serialized batch id', async function () {
      // given
      const i18n = getI18n();
      const result = new SessionPublicationBatchResult('batchId');
      result.addPublicationError('sessionId1', new Error('an error'));

      const request = {
        i18n,
        payload: {
          data: {
            attributes: {
              ids: ['sessionId1', 'sessionId2'],
            },
          },
        },
      };
      sinon.stub(usecases, 'publishSessionsInBatch').resolves(result);
      sinon.stub(logger, 'warn');

      // when
      const error = await catchErr(sessionController.publishInBatch)(request, hFake);

      // then
      expect(error).to.be.an.instanceof(SessionPublicationBatchError);
    });
  });

  describe('#flagResultsAsSentToPrescriber', function () {
    let sessionId;
    let session;
    let serializedSession;

    beforeEach(function () {
      sessionId = 123;
      session = Symbol('session');
      serializedSession = Symbol('serializedSession');
      request = {
        params: {
          id: sessionId,
        },
      };
    });

    context('when the session results were already flagged as sent', function () {
      beforeEach(function () {
        const usecaseResult = { resultsFlaggedAsSent: false, session };
        sinon.stub(usecases, 'flagSessionResultsAsSentToPrescriber').withArgs({ sessionId }).resolves(usecaseResult);
      });

      it('should return the serialized session', async function () {
        // given
        const sessionSerializer = {
          serialize: sinon.stub(),
        };
        sessionSerializer.serialize.withArgs({ session }).resolves(serializedSession);

        // when
        const response = await sessionController.flagResultsAsSentToPrescriber(request, hFake, { sessionSerializer });

        // then
        expect(response).to.equal(serializedSession);
      });
    });

    context('when the session results were not flagged as sent', function () {
      beforeEach(function () {
        const usecaseResult = { resultsFlaggedAsSent: true, session };
        sinon.stub(usecases, 'flagSessionResultsAsSentToPrescriber').withArgs({ sessionId }).resolves(usecaseResult);
      });

      it('should return the serialized session with code 201', async function () {
        // given
        const sessionSerializer = { serialize: sinon.stub() };
        sessionSerializer.serialize.withArgs({ session }).resolves(serializedSession);

        // when
        const response = await sessionController.flagResultsAsSentToPrescriber(request, hFake, { sessionSerializer });

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.source).to.equal(serializedSession);
      });
    });
  });

  describe('#findPaginatedFilteredJurySessions', function () {
    it('should return the serialized jurySessions', async function () {
      // given
      const queryParamsUtils = { extractParameters: sinon.stub() };
      const sessionValidator = { validateAndNormalizeFilters: sinon.stub() };
      const jurySessionRepository = { findPaginatedFiltered: sinon.stub() };
      const jurySessionSerializer = { serializeForPaginatedList: sinon.stub() };
      const request = { query: {} };
      const filter = { filter1: ' filter1ToTrim', filter2: 'filter2' };
      const normalizedFilters = 'normalizedFilters';
      const page = 'somePageConfiguration';
      const jurySessionsForPaginatedList = Symbol('jurySessionsForPaginatedList');
      const serializedJurySessionsForPaginatedList = Symbol('serializedJurySessionsForPaginatedList');
      queryParamsUtils.extractParameters.withArgs(request.query).returns({ filter, page });
      sessionValidator.validateAndNormalizeFilters.withArgs(filter).returns(normalizedFilters);
      jurySessionRepository.findPaginatedFiltered
        .withArgs({ filters: normalizedFilters, page })
        .resolves(jurySessionsForPaginatedList);
      jurySessionSerializer.serializeForPaginatedList
        .withArgs(jurySessionsForPaginatedList)
        .returns(serializedJurySessionsForPaginatedList);

      // when
      const result = await sessionController.findPaginatedFilteredJurySessions(request, hFake, {
        queryParamsUtils,
        sessionValidator,
        jurySessionRepository,
        jurySessionSerializer,
      });

      // then
      expect(result).to.equal(serializedJurySessionsForPaginatedList);
    });
  });

  describe('#assignCertificationOfficer', function () {
    it('should return updated session', async function () {
      // given
      const sessionId = 1;
      const session = Symbol('session');
      const sessionJsonApi = Symbol('someSessionSerialized');
      const request = {
        params: { id: sessionId },
        auth: {
          credentials: {
            userId,
          },
        },
      };
      sinon
        .stub(usecases, 'assignCertificationOfficerToJurySession')
        .withArgs({
          sessionId,
          certificationOfficerId: userId,
        })
        .resolves(session);
      const jurySessionSerializer = { serialize: sinon.stub() };
      jurySessionSerializer.serialize.withArgs(session).returns(sessionJsonApi);

      // when
      const response = await sessionController.assignCertificationOfficer(request, hFake, { jurySessionSerializer });

      // then
      expect(usecases.assignCertificationOfficerToJurySession).to.have.been.calledWithExactly({
        sessionId,
        certificationOfficerId: userId,
      });
      expect(response).to.deep.equal(sessionJsonApi);
    });
  });

  describe('#commentAsJury', function () {
    it('should update the session with a comment', async function () {
      // given
      const sessionId = 1;
      const userId = 1;
      sinon.stub(usecases, 'commentSessionAsJury');
      request = {
        params: { id: sessionId },
        auth: {
          credentials: {
            userId,
          },
        },
        payload: {
          'jury-comment': 'Un commentaire du pôle certif',
        },
      };

      // when
      await sessionController.commentAsJury(request, hFake);

      // then
      expect(usecases.commentSessionAsJury).to.have.been.calledWithExactly({
        sessionId,
        juryCommentAuthorId: userId,
        juryComment: 'Un commentaire du pôle certif',
      });
    });
  });

  describe('#delete', function () {
    it('should delete the session', async function () {
      // given
      const sessionId = 1;
      const userId = 1;
      sinon.stub(usecases, 'deleteSession');
      request = {
        params: { id: sessionId },
        auth: {
          credentials: {
            userId,
          },
        },
      };

      // when
      await sessionController.remove(request, hFake);

      // then
      expect(usecases.deleteSession).to.have.been.calledWithExactly({
        sessionId,
      });
    });
  });

  describe('#deleteJuryComment', function () {
    it('should delete the session comment', async function () {
      // given
      const sessionId = 1;
      sinon.stub(usecases, 'deleteSessionJuryComment');
      request = { params: { id: sessionId } };

      // when
      const response = await sessionController.deleteJuryComment(request, hFake);

      // then
      expect(usecases.deleteSessionJuryComment).to.have.been.calledWithExactly({
        sessionId,
      });
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('#getSupervisorKitPdf', function () {
    it('should return supervisor kit', async function () {
      // given
      sinon.stub(usecases, 'getSupervisorKitSessionInfo');
      const sessionMainInfo = domainBuilder.buildSessionForSupervisorKit({ id: 1 });
      const supervisorKitBuffer = 'binary string';
      const userId = 1;
      const request = {
        auth: { credentials: { userId } },
        params: { id: sessionMainInfo.id },
        query: {
          accessToken: 'ACCESS_TOKEN',
        },
      };
      const tokenService = {
        extractUserId: sinon.stub(),
      };
      const requestResponseUtils = {
        extractLocaleFromRequest: sinon.stub(),
      };
      tokenService.extractUserId.withArgs(request.query.accessToken).returns(userId);
      const supervisorKitPdf = {
        getSupervisorKitPdfBuffer: sinon.stub(),
      };
      supervisorKitPdf.getSupervisorKitPdfBuffer.resolves({
        buffer: supervisorKitBuffer,
        fileName: `kit-surveillant-${sessionMainInfo.id}.pdf`,
      });
      usecases.getSupervisorKitSessionInfo.resolves(sessionMainInfo);

      // when
      const response = await sessionController.getSupervisorKitPdf(request, hFake, {
        tokenService,
        requestResponseUtils,
        supervisorKitPdf,
      });

      // then
      expect(usecases.getSupervisorKitSessionInfo).to.have.been.calledWithExactly({
        userId,
        sessionId: sessionMainInfo.id,
      });
      expect(response.source).to.deep.equal(supervisorKitBuffer);
      expect(response.headers['Content-Disposition']).to.contains(`attachment; filename=kit-surveillant-1.pdf`);
    });
  });

  describe('#getSessionPDFAttestations', function () {
    it('should return an attestation in PDF binary format', async function () {
      // given
      const certificationAttestationPdf = {
        getCertificationAttestationsPdfBuffer: sinon.stub(),
      };
      const session = domainBuilder.buildSession.finalized({ id: 12 });
      domainBuilder.buildCertificationCourse({
        id: 1,
        sessionId: 12,
        userId: 1,
        completedAt: '2020-01-01',
      });
      domainBuilder.buildCertificationCourse({
        id: 2,
        sessionId: 12,
        userId: 2,
        completedAt: '2020-01-01',
      });
      domainBuilder.buildCertificationCourse({
        id: 3,
        sessionId: 12,
        userId: 3,
        completedAt: '2020-01-01',
      });
      const certification1 = domainBuilder.buildPrivateCertificateWithCompetenceTree({ id: 1 });
      const certification2 = domainBuilder.buildPrivateCertificateWithCompetenceTree({ id: 2 });
      const certification3 = domainBuilder.buildPrivateCertificateWithCompetenceTree({ id: 3 });
      const attestationPDF = 'binary string';
      const userId = 1;
      const i18n = getI18n();

      const request = {
        auth: { credentials: { userId } },
        params: { id: session.id },
        query: { isFrenchDomainExtension: true },
        i18n,
      };

      sinon
        .stub(usecases, 'getCertificationAttestationsForSession')
        .withArgs({
          sessionId: session.id,
        })
        .resolves([certification1, certification2, certification3]);

      certificationAttestationPdf.getCertificationAttestationsPdfBuffer
        .withArgs({
          certificates: [certification1, certification2, certification3],
          isFrenchDomainExtension: true,
          i18n,
        })
        .resolves({ buffer: attestationPDF });

      // when
      const response = await sessionController.getCertificationPDFAttestationsForSession(request, hFake, {
        certificationAttestationPdf,
      });

      // then
      expect(response.source).to.deep.equal(attestationPDF);
      expect(response.headers['Content-Disposition']).to.contains(
        'attachment; filename=attestation-pix-session-12.pdf',
      );
    });
  });
});

function buildRequest(sessionId, userId, firstName, lastName, birthdate) {
  return {
    params: { id: sessionId },
    auth: {
      credentials: {
        userId,
      },
    },
    payload: {
      data: {
        attributes: {
          'first-name': firstName,
          'last-name': lastName,
          birthdate: birthdate,
        },
        type: 'certification-candidates',
      },
    },
  };
}
