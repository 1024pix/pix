const _ = require('lodash');
const { expect, sinon, hFake, catchErr } = require('../../../test-helper');

const sessionController = require('../../../../lib/application/sessions/session-controller');
const usecases = require('../../../../lib/domain/usecases');
const Session = require('../../../../lib/domain/models/Session');

const sessionSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/session-serializer');
const jurySessionSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/jury-session-serializer');
const certificationCandidateSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-candidate-serializer');
const certificationReportSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-report-serializer');
const juryCertificationSummarySerializer = require('../../../../lib/infrastructure/serializers/jsonapi/jury-certification-summary-serializer');
const queryParamsUtils = require('../../../../lib/infrastructure/utils/query-params-utils');
const requestResponseUtils = require('../../../../lib/infrastructure/utils/request-response-utils');
const sessionValidator = require('../../../../lib/domain/validators/session-validator');
const juryCertificationSummaryRepository = require('../../../../lib/infrastructure/repositories/jury-certification-summary-repository');
const jurySessionRepository = require('../../../../lib/infrastructure/repositories/jury-session-repository');
const UserAlreadyLinkedToCertificationCandidate = require('../../../../lib/domain/events/UserAlreadyLinkedToCertificationCandidate');
const UserLinkedToCertificationCandidate = require('../../../../lib/domain/events/UserLinkedToCertificationCandidate');
const certificationResults = require('../../../../lib/infrastructure/utils/csv/certification-results');
const tokenService = require('../../../../lib/domain/services/token-service');
const { SessionPublicationBatchResult } = require('../../../../lib/domain/models/SessionPublicationBatchResult');
const logger = require('../../../../lib/infrastructure/logger');
const { SessionPublicationBatchError } = require('../../../../lib/application/http-errors');

describe('Unit | Controller | sessionController', () => {

  let request;
  let expectedSession;
  const userId = 274939274;

  describe('#create', () => {

    beforeEach(() => {
      expectedSession = new Session({
        certificationCenter: 'Université de dressage de loutres',
        address: 'Nice',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        date: '2017-12-08',
        time: '14:30',
        description: 'ahah',
        accessCode: 'ABCD12',
      });

      sinon.stub(usecases, 'createSession').resolves();
      sinon.stub(sessionSerializer, 'deserialize').returns(expectedSession);
      sinon.stub(sessionSerializer, 'serialize');

      request = {
        payload: {
          data: {
            type: 'sessions',
            attributes: {
              'certification-center': 'Université de dressage de loutres',
              address: 'Nice',
              room: '28D',
              examiner: 'Antoine Toutvenant',
              date: '2017-12-08',
              time: '14:30',
              description: 'ahah',
            },
          },
        },
        auth: {
          credentials: {
            userId,
          },
        },
      };
    });

    it('should save the session', async () => {
      // when
      await sessionController.save(request, hFake);

      // then
      expect(usecases.createSession).to.have.been.calledWith({ userId, session: expectedSession });
    });

    it('should return the saved session in JSON API', async () => {
      // given
      const jsonApiSession = {
        data: {
          type: 'sessions',
          id: 12,
          attributes: {},
        },
      };
      const savedSession = new Session({
        id: '12',
        certificationCenter: 'Université de dressage de loutres',
      });

      usecases.createSession.resolves(savedSession);
      sessionSerializer.serialize.returns(jsonApiSession);

      // when
      const response = await sessionController.save(request, hFake);

      // then
      expect(response).to.deep.equal(jsonApiSession);
      expect(sessionSerializer.serialize).to.have.been.calledWith(savedSession);
    });
  });

  describe('#getJurySession', function() {
    const sessionId = 123;

    beforeEach(() => {
      sinon.stub(usecases, 'getJurySession');
      sinon.stub(jurySessionSerializer, 'serialize');
      request = {
        auth: { credentials: { userId } },
        params: {
          id: sessionId.toString(),
        },
      };
    });

    context('when session exists', () => {

      it('should reply serialized session informations', async function() {
        // given
        const foundJurySession = Symbol('foundSession');
        const serializedJurySession = Symbol('serializedSession');
        usecases.getJurySession.withArgs({ sessionId }).resolves(foundJurySession);
        jurySessionSerializer.serialize.withArgs(foundJurySession).resolves(serializedJurySession);

        // when
        const response = await sessionController.getJurySession(request, hFake);

        // then
        expect(response).to.deep.equal(serializedJurySession);
      });

    });
  });

  describe('#get', function() {
    const sessionId = 123;

    beforeEach(() => {
      sinon.stub(usecases, 'getSession');
      sinon.stub(sessionSerializer, 'serialize');
      request = {
        auth: { credentials: { userId } },
        params: {
          id: sessionId.toString(),
        },
      };
    });

    context('when session exists', () => {

      it('should reply serialized session informations', async function() {
        // given
        const foundSession = Symbol('foundSession');
        const serializedSession = Symbol('serializedSession');
        usecases.getSession.withArgs({ sessionId }).resolves(foundSession);
        sessionSerializer.serialize.withArgs(foundSession).resolves(serializedSession);

        // when
        const response = await sessionController.get(request, hFake);

        // then
        expect(response).to.deep.equal(serializedSession);
      });

    });
  });

  describe('#update', () => {
    let request, updatedSession, updateSessionArgs;

    beforeEach(() => {
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
      sinon.stub(sessionSerializer, 'deserialize');
      sinon.stub(sessionSerializer, 'serialize');
      sessionSerializer.deserialize.withArgs(request.payload).returns({});
    });

    it('should return the updated session', async () => {
      // given
      usecases.updateSession.withArgs(updateSessionArgs).resolves(updatedSession);
      sessionSerializer.serialize.withArgs(updatedSession).returns(updatedSession);

      // when
      const response = await sessionController.update(request, hFake);

      // then
      expect(response).to.deep.equal(updatedSession);
    });

  });

  describe('#getAttendanceSheet', () => {
    const tokenService = { extractUserId: _.noop };
    let request;
    const sessionId = 1;
    const odsBuffer = Buffer.alloc(5);
    const accessToken = 'ABC123';

    beforeEach(() => {
      request = {
        params: { id: sessionId },
        payload: {},
        query: {
          accessToken,
        },
      };

      sinon.stub(usecases, 'getAttendanceSheet');
      sinon.stub(tokenService, 'extractUserId').withArgs(accessToken).returns(userId);
    });

    it('should return the feuille d\'émargement', async () => {
      // given
      usecases.getAttendanceSheet.withArgs({ sessionId, userId }).resolves(odsBuffer);

      // when
      const response = await sessionController.getAttendanceSheet(request, hFake);

      // then
      const expectedHeaders = {
        'Content-Disposition': `attachment; filename=feuille-emargement-session-${sessionId}.ods`,
        'Content-Type': 'application/vnd.oasis.opendocument.spreadsheet',
      };
      expect(response.headers).to.deep.equal(expectedHeaders);
    });

  });

  describe('#importCertificationCandidatesFromAttendanceSheet', () => {

    const sessionId = 2;
    let request;
    const odsBuffer = 'File Buffer';
    beforeEach(() => {
      // given
      request = {
        params: { id: sessionId },
        payload: { file: odsBuffer },
      };

      sinon.stub(usecases, 'importCertificationCandidatesFromAttendanceSheet').resolves();
    });

    it('should call the usecase to import certification candidates', async () => {
      // given
      usecases.importCertificationCandidatesFromAttendanceSheet.resolves();

      // when
      await sessionController.importCertificationCandidatesFromAttendanceSheet(request);

      // then
      expect(usecases.importCertificationCandidatesFromAttendanceSheet).to.have.been.calledWith({
        sessionId,
        odsBuffer,
      });
    });
  });

  describe('#getCertificationCandidates', () => {
    let request;
    const sessionId = 1;
    const certificationCandidates = 'candidates';
    const certificationCandidatesJsonApi = 'candidatesJSONAPI';

    beforeEach(() => {
      // given
      request = {
        params: { id: sessionId },
      };
      sinon.stub(usecases, 'getSessionCertificationCandidates').withArgs({ sessionId }).resolves(certificationCandidates);
      sinon.stub(certificationCandidateSerializer, 'serialize').withArgs(certificationCandidates).returns(certificationCandidatesJsonApi);
    });

    it('should return certification candidates', async () => {
      // when
      const response = await sessionController.getCertificationCandidates(request, hFake);

      // then
      expect(response).to.deep.equal(certificationCandidatesJsonApi);
    });

  });

  describe('#addCertificationCandidate ', () => {
    let request;
    const sessionId = 1;
    const certificationCandidate = 'candidate';
    const addedCertificationCandidate = 'addedCandidate';
    const certificationCandidateJsonApi = 'addedCandidateJSONApi';

    beforeEach(() => {
      // given
      request = {
        params: { id: sessionId },
      };
      sinon.stub(certificationCandidateSerializer, 'deserialize').resolves(certificationCandidate);
      sinon.stub(usecases, 'addCertificationCandidateToSession').withArgs({
        sessionId,
        certificationCandidate,
      }).resolves(addedCertificationCandidate);
      sinon.stub(certificationCandidateSerializer, 'serialize').withArgs(addedCertificationCandidate).returns(certificationCandidateJsonApi);
    });

    it('should return the added certification candidate', async () => {
      // when
      const response = await sessionController.addCertificationCandidate(request, hFake);

      // then
      expect(response.source).to.equal(certificationCandidateJsonApi);
      expect(response.statusCode).to.equal(201);
    });

  });

  describe('#deleteCertificationCandidate ', () => {
    let request;
    const sessionId = 1;
    const certificationCandidateId = 1;

    beforeEach(() => {
      // given
      request = {
        params: { id: sessionId, certificationCandidateId },
      };
      sinon.stub(usecases, 'deleteUnlinkedCertificationCandidate').withArgs({ certificationCandidateId }).resolves();
    });

    it('should return 204 when deleting successfully the candidate', async () => {
      // when
      const response = await sessionController.deleteCertificationCandidate(request, hFake);

      // then
      expect(response).to.be.null;
    });

  });

  describe('#getJuryCertificationSummaries ', () => {
    let request;
    const sessionId = 1;
    const juryCertificationSummaries = 'someSummaries';
    const juryCertificationSummariesJSONAPI = 'someSummariesJSONApi';

    beforeEach(() => {
      // given
      request = {
        params: { id: sessionId },
        auth: {
          credentials: {
            userId,
          },
        },
      };
      sinon.stub(juryCertificationSummaryRepository, 'findBySessionId').withArgs(sessionId).resolves(juryCertificationSummaries);
      sinon.stub(juryCertificationSummarySerializer, 'serialize').withArgs(juryCertificationSummaries).returns(juryCertificationSummariesJSONAPI);
    });

    it('should return jury certification summaries', async () => {
      // when
      const response = await sessionController.getJuryCertificationSummaries(request, hFake);

      // then
      expect(response).to.deep.equal(juryCertificationSummariesJSONAPI);
    });

  });

  describe('#getSessionResultsByRecipientEmail ', () => {

    it('should return csv content and fileName', async () => {
      // given
      const session = { id: 1, date: '2020/01/01', time: '12:00' };
      sinon.stub(tokenService, 'extractResultRecipientEmailAndSessionId')
        .withArgs('abcd1234')
        .returns({ sessionId: 1, resultRecipientEmail: 'user@example.net' });
      sinon.stub(usecases, 'getSessionResultsByResultRecipientEmail')
        .withArgs({ sessionId: session.id, resultRecipientEmail: 'user@example.net' })
        .resolves({
          session,
          certificationResults: [],
          fileName: '20200101_1200_resultats_session_1.csv',
        });
      sinon.stub(certificationResults, 'getSessionCertificationResultsCsv');
      certificationResults.getSessionCertificationResultsCsv.withArgs({ session, certificationResults: [] })
        .resolves('csv content');

      // when
      const response = await sessionController
        .getSessionResultsByRecipientEmail({ params: { token: 'abcd1234' } }, hFake);

      // then
      const expectedCsv = 'csv content';
      const expectedHeader = 'attachment; filename=20200101_1200_resultats_session_1.csv';
      expect(response.source.trim()).to.deep.equal(expectedCsv.trim());
      expect(response.headers['Content-Disposition']).to.equal(expectedHeader);
    });
  });

  describe('#getSessionResultsToDownload ', () => {

    it('should return results to download', async () => {
      // given
      const session = { id: 1, date: '2020/01/01', time: '12:00' };
      const sessionId = session.id;
      const fileName = `20200101_1200_resultats_session_${sessionId}.csv`;
      const certificationResults = [];
      const token = Symbol('a beautiful token');
      const request = {
        params: { id: sessionId, token },
        auth: {
          credentials: { userId },
        },
      };
      sinon.stub(tokenService, 'extractSessionId').withArgs(token).returns({ sessionId });
      sinon.stub(usecases, 'getSessionResults').withArgs({ sessionId }).resolves({
        session,
        certificationResults,
        fileName,
      });

      // when
      const response = await sessionController.getSessionResultsToDownload(request, hFake);

      // then
      const expectedHeader = `attachment; filename=${fileName}`;
      const expectedCsv = '"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Statut";"Nombre de Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Session";"Centre de certification";"Date de passage de la certification"';
      expect(response.source.trim()).to.deep.equal(expectedCsv);
      expect(response.headers['Content-Disposition']).to.equal(expectedHeader);
    });
  });

  describe('#getCertificationReports', () => {
    let request;
    const sessionId = 1;
    const certificationReports = Symbol('some certification reports');
    const serializedCertificationReports = Symbol('some serialized certification reports');

    beforeEach(() => {
      // given
      request = {
        params: { id: sessionId },
      };
      sinon.stub(usecases, 'getSessionCertificationReports').withArgs({ sessionId }).resolves(certificationReports);
      sinon.stub(certificationReportSerializer, 'serialize').withArgs(certificationReports).returns(serializedCertificationReports);
    });

    it('should return certification candidates', async () => {
      // when
      const response = await sessionController.getCertificationReports(request, hFake);

      // then
      expect(response).to.deep.equal(serializedCertificationReports);
    });

  });

  describe('#enrollStudentsToSession', () => {
    let request;
    const sessionId = 1;
    const userId = 2;
    const student1 = { id: 1 };
    const student2 = { id: 2 };
    const studentIds = [student1.id, student2.id];
    const studentList = [student1, student2];
    const serializedCertificationCandidate = Symbol('CertificationCandidates');

    beforeEach(() => {
      // given
      request = {
        params: { id: sessionId },
        auth: {
          credentials: {
            userId,
          },
        },
        payload: {
          data: {
            attributes: {
              'student-ids': [student1.id, student2.id],
            },
          },
        },
      };
      sinon.stub(requestResponseUtils, 'extractUserIdFromRequest');
      sinon.stub(usecases, 'enrollStudentsToSession');
      sinon.stub(usecases, 'getSessionCertificationCandidates');
      sinon.stub(certificationCandidateSerializer, 'serialize');
    });

    context('when the user has access to session and there studentIds are corrects', () => {

      beforeEach(() => {
        requestResponseUtils.extractUserIdFromRequest.withArgs(request).returns(userId);
        usecases.enrollStudentsToSession.withArgs({ sessionId, referentId: userId, studentIds }).resolves();
        usecases.getSessionCertificationCandidates.withArgs({ sessionId }).resolves(studentList);
        certificationCandidateSerializer.serialize.withArgs(studentList).returns(serializedCertificationCandidate);
      });

      it('should return certificationCandidates', async () => {
        // when
        const response = await sessionController.enrollStudentsToSession(request, hFake);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.source).to.deep.equal(serializedCertificationCandidate);
      });
    });

  });

  describe('#createCandidateParticipation', () => {
    const sessionId = 1;
    const userId = 2;
    let firstName;
    let lastName;
    const birthdate = Symbol('birthdate');
    const linkedCertificationCandidate = Symbol('candidate');
    const serializedCertificationCandidate = Symbol('sCandidate');

    beforeEach(() => {
      // given
      firstName = 'firstName';
      lastName = 'lastName';
      sinon.stub(certificationCandidateSerializer, 'serialize')
        .withArgs(linkedCertificationCandidate)
        .returns(serializedCertificationCandidate);
    });

    it('trims the firstname and lastname', async () => {
      // given
      firstName = 'firstName     ';
      lastName = 'lastName    ';
      sinon.stub(usecases, 'linkUserToSessionCertificationCandidate')
        .withArgs({
          userId,
          sessionId,
          firstName: 'firstName',
          lastName: 'lastName',
          birthdate,
        }).resolves(new UserAlreadyLinkedToCertificationCandidate());
      sinon.stub(usecases, 'getCertificationCandidate')
        .withArgs({ userId, sessionId })
        .resolves(linkedCertificationCandidate);
      const request = buildRequest(sessionId, userId, firstName, lastName, birthdate);

      // when
      const response = await sessionController.createCandidateParticipation(request, hFake);

      // then
      expect(response).to.equal(serializedCertificationCandidate);
    });

    context('when the participation already exists', () => {

      beforeEach(() => {
        sinon.stub(usecases, 'linkUserToSessionCertificationCandidate')
          .withArgs({ userId, sessionId, firstName, lastName, birthdate })
          .resolves(new UserAlreadyLinkedToCertificationCandidate());
        sinon.stub(usecases, 'getCertificationCandidate')
          .withArgs({ userId, sessionId })
          .resolves(linkedCertificationCandidate);
      });

      it('should return a certification candidate', async () => {
        // given
        const request = buildRequest(sessionId, userId, firstName, lastName, birthdate);
        // when
        const response = await sessionController.createCandidateParticipation(request, hFake);

        // then
        expect(response).to.equals(serializedCertificationCandidate);
      });

    });

    context('when the participation is created', () => {

      beforeEach(() => {
        sinon.stub(usecases, 'linkUserToSessionCertificationCandidate')
          .withArgs({ userId, sessionId, firstName, lastName, birthdate })
          .resolves(new UserLinkedToCertificationCandidate());
        sinon.stub(usecases, 'getCertificationCandidate')
          .withArgs({ userId, sessionId })
          .resolves(linkedCertificationCandidate);
      });

      it('should return a certification candidate', async () => {
        // given
        const request = buildRequest(sessionId, userId, firstName, lastName, birthdate);

        // when
        const response = await sessionController.createCandidateParticipation(request, hFake);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.source).to.equals(serializedCertificationCandidate);
      });

    });

  });

  describe('#finalize', () => {
    let request;
    const sessionId = 1;
    const aCertificationReport = Symbol('a certficication report');
    const updatedSession = Symbol('updatedSession');
    const examinerGlobalComment = 'It was a fine session my dear';
    const certificationReports = [
      {
        type: 'certification-reports',
      },
    ];

    beforeEach(() => {
      // given
      request = {
        params: {
          id: sessionId,
        },
        payload: {
          data: {
            attributes: {
              'examiner-global-comment': examinerGlobalComment,
            },
            included: certificationReports,
          },
        },
      };

      sinon.stub(certificationReportSerializer, 'deserialize').resolves(aCertificationReport);
      sinon.stub(usecases, 'finalizeSession').resolves(updatedSession);
      sinon.stub(usecases, 'getSession').resolves(updatedSession);
      sinon.stub(sessionSerializer, 'serializeForFinalization').withArgs(updatedSession);
    });

    it('should call the finalizeSession usecase with correct values', async () => {
      // when
      await sessionController.finalize(request);

      // then
      expect(usecases.finalizeSession).to.have.been.calledWithExactly({
        sessionId,
        examinerGlobalComment,
        certificationReports: [aCertificationReport],
      });
    });
  });

  describe('#publish / #unpublish', () => {
    const sessionId = 123;
    const session = Symbol('session');
    const serializedSession = Symbol('serializedSession');

    beforeEach(() => {
      request = {
        params: {
          id: sessionId,
        },
        payload: {
          data: { attributes: {} },
        },
      };
    });

    context('when publishing', () => {

      beforeEach(() => {
        request.payload.data.attributes.toPublish = true;
        const usecaseResult = session;
        sinon.stub(usecases, 'publishSession').withArgs({
          sessionId,
        }).resolves(usecaseResult);
        sinon.stub(sessionSerializer, 'serialize').withArgs(session).resolves(serializedSession);
      });

      it('should return the serialized session', async () => {
        // when
        const response = await sessionController.publish(request);

        // then
        expect(response).to.equal(serializedSession);
      });

    });

    context('when unpublishing', () => {

      beforeEach(() => {
        request.payload.data.attributes.toPublish = false;
        const usecaseResult = session;
        sinon.stub(usecases, 'unpublishSession').withArgs({
          sessionId,
        }).resolves(usecaseResult);
        sinon.stub(sessionSerializer, 'serialize').withArgs(session).resolves(serializedSession);
      });

      it('should return the serialized session', async () => {
        // when
        const response = await sessionController.unpublish(request);

        // then
        expect(response).to.equal(serializedSession);
      });
    });
  });

  describe('#publishInBatch', () => {
    it('returns 204 when no error occurred', async () => {
      // given
      const request = {
        payload: {
          data: {
            attributes: {
              ids: ['sessionId1', 'sessionId2'],
            },
          },
        },
      };
      sinon.stub(usecases, 'publishSessionsInBatch').withArgs({
        sessionIds: ['sessionId1', 'sessionId2'],
      }).resolves(new SessionPublicationBatchResult('batchId'));

      // when
      const response = await sessionController.publishInBatch(request, hFake);
      // then
      expect(response.statusCode).to.equal(204);
    });

    it('logs errors when errors occur', async () => {
      // given
      const result = new SessionPublicationBatchResult('batchId');
      result.addPublicationError('sessionId1', new Error('an error'));
      result.addPublicationError('sessionId2', new Error('another error'));

      const request = {
        payload: {
          data: {
            attributes: {
              ids: ['sessionId1', 'sessionId2'],
            },
          },
        },
      };
      sinon.stub(usecases, 'publishSessionsInBatch').withArgs({
        sessionIds: ['sessionId1', 'sessionId2'],
      }).resolves(result);
      sinon.stub(logger, 'warn');

      // when
      await catchErr(sessionController.publishInBatch)(request, hFake);

      // then
      expect(logger.warn).to.have.been.calledWithExactly('One or more error occurred when publishing session in batch batchId');

      expect(logger.warn).to.have.been.calledWithExactly({
        batchId: 'batchId',
        sessionId: 'sessionId1',
      }, 'an error');

      expect(logger.warn).to.have.been.calledWithExactly({
        batchId: 'batchId',
        sessionId: 'sessionId2',
      }, 'another error');
    });

    it('returns the serialized batch id', async () => {
      // given
      const result = new SessionPublicationBatchResult('batchId');
      result.addPublicationError('sessionId1', new Error('an error'));

      const request = {
        payload: {
          data: {
            attributes: {
              ids: ['sessionId1', 'sessionId2'],
            },
          },
        },
      };
      sinon.stub(usecases, 'publishSessionsInBatch').withArgs({
        sessionIds: ['sessionId1', 'sessionId2'],
      }).resolves(result);
      sinon.stub(logger, 'warn');

      // when
      const error = await catchErr(sessionController.publishInBatch)(request, hFake);

      // then
      expect(error).to.be.an.instanceof(SessionPublicationBatchError);
    });
  });

  describe('#flagResultsAsSentToPrescriber', () => {
    const sessionId = 123;
    const session = Symbol('session');
    const serializedSession = Symbol('serializedSession');

    beforeEach(() => {
      request = {
        params: {
          id: sessionId,
        },
      };
    });

    context('when the session results were already flagged as sent', () => {

      beforeEach(() => {
        const usecaseResult = { resultsFlaggedAsSent: false, session };
        sinon.stub(usecases, 'flagSessionResultsAsSentToPrescriber').withArgs({ sessionId }).resolves(usecaseResult);
        sinon.stub(sessionSerializer, 'serialize').withArgs(session).resolves(serializedSession);
      });

      it('should return the serialized session', async () => {
        // when
        const response = await sessionController.flagResultsAsSentToPrescriber(request, hFake);

        // then
        expect(response).to.equal(serializedSession);
      });

    });

    context('when the session results were not flagged as sent', () => {

      beforeEach(() => {
        const usecaseResult = { resultsFlaggedAsSent: true, session };
        sinon.stub(usecases, 'flagSessionResultsAsSentToPrescriber').withArgs({ sessionId }).resolves(usecaseResult);
        sinon.stub(sessionSerializer, 'serialize').withArgs(session).resolves(serializedSession);
      });

      it('should return the serialized session with code 201', async () => {
        // when
        const response = await sessionController.flagResultsAsSentToPrescriber(request, hFake);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.source).to.equal(serializedSession);
      });
    });
  });

  describe('#findPaginatedFilteredJurySessions', () => {

    beforeEach(() => {
      sinon.stub(queryParamsUtils, 'extractParameters');
      sinon.stub(sessionValidator, 'validateAndNormalizeFilters');
      sinon.stub(jurySessionRepository, 'findPaginatedFiltered');
      sinon.stub(jurySessionSerializer, 'serializeForPaginatedList');
      sinon.stub(requestResponseUtils, 'extractUserIdFromRequest');
    });

    it('should return the serialized jurySessions', async () => {
      // given
      const currentUserId = 5;
      const request = { query: {} };
      const filter = { filter1: ' filter1ToTrim', filter2: 'filter2' };
      const normalizedFilters = 'normalizedFilters';
      const page = 'somePageConfiguration';
      const jurySessionsForPaginatedList = Symbol('jurySessionsForPaginatedList');
      const serializedJurySessionsForPaginatedList = Symbol('serializedJurySessionsForPaginatedList');
      queryParamsUtils.extractParameters.withArgs(request.query).returns({ filter, page });
      sessionValidator.validateAndNormalizeFilters.withArgs(filter, currentUserId)
        .returns(normalizedFilters);
      jurySessionRepository.findPaginatedFiltered.withArgs({ filters: normalizedFilters, page })
        .resolves(jurySessionsForPaginatedList);
      jurySessionSerializer.serializeForPaginatedList.withArgs(jurySessionsForPaginatedList).returns(serializedJurySessionsForPaginatedList);
      requestResponseUtils.extractUserIdFromRequest.withArgs(request).returns(currentUserId);

      // when
      const result = await sessionController.findPaginatedFilteredJurySessions(request, hFake);

      // then
      expect(result).to.equal(serializedJurySessionsForPaginatedList);
    });
  });

  describe('#assignCertificationOfficer', () => {
    let request;
    const sessionId = 1;
    const session = Symbol('session');
    const sessionJsonApi = Symbol('someSessionSerialized');

    beforeEach(() => {
      // given
      request = {
        params: { id: sessionId },
        auth: {
          credentials: {
            userId,
          },
        },
      };
      sinon.stub(usecases, 'assignCertificationOfficerToJurySession').withArgs({
        sessionId,
        certificationOfficerId: userId,
      }).resolves(session);
      sinon.stub(jurySessionSerializer, 'serialize').withArgs(session).returns(sessionJsonApi);
    });

    it('should return updated session', async () => {
      // when
      const response = await sessionController.assignCertificationOfficer(request, hFake);

      // then
      expect(usecases.assignCertificationOfficerToJurySession).to.have.been.calledWithExactly({
        sessionId,
        certificationOfficerId: userId,
      });
      expect(response).to.deep.equal(sessionJsonApi);
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
          'birthdate': birthdate,
        },
        type: 'certification-candidates',
      },
    },
  };
}
