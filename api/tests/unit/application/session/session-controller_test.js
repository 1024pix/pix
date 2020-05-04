const _ = require('lodash');
const { expect, sinon, hFake } = require('../../../test-helper');

const sessionController = require('../../../../lib/application/sessions/session-controller');
const usecases = require('../../../../lib/domain/usecases');
const Session = require('../../../../lib/domain/models/Session');

const sessionSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/session-serializer');
const jurySessionSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/jury-session-serializer');
const certificationCandidateSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-candidate-serializer');
const certificationResultSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-result-serializer');
const certificationReportSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-report-serializer');
const queryParamsUtils = require('../../../../lib/infrastructure/utils/query-params-utils');
const sessionValidator = require('../../../../lib/domain/validators/session-validator');
const jurySessionRepository = require('../../../../lib/infrastructure/repositories/jury-session-repository');

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
        accessCode: 'ABCD12'
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
              description: 'ahah'
            }
          }
        },
        auth: {
          credentials: {
            userId,
          }
        }
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
          attributes: {}
        }
      };
      const savedSession = new Session({
        id: '12',
        certificationCenter: 'Université de dressage de loutres'
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
        }
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
        }
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
        params: { id : 1 },
        payload: {}
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
    let request, expectedHeaders;
    const sessionId = 1;
    const odsBuffer = Buffer.alloc(5);
    const accessToken = 'ABC123';

    beforeEach(() => {
      request = {
        params: { id : sessionId },
        payload: {},
        query: {
          accessToken,
        }
      };

      expectedHeaders = {
        'Content-Disposition': `attachment; filename=pv-session-${sessionId}.ods`,
        'Content-Type': 'application/vnd.oasis.opendocument.spreadsheet',
      };

      sinon.stub(usecases, 'getAttendanceSheet');
      sinon.stub(tokenService, 'extractUserId').withArgs(accessToken).returns(userId);
    });

    it('should return attendance sheet', async () => {
      // given
      usecases.getAttendanceSheet.withArgs({ sessionId, userId }).resolves(odsBuffer);

      // when
      const response = await sessionController.getAttendanceSheet(request, hFake);

      // then
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
        params: { id : sessionId },
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
        params: { id : sessionId },
      };
      sinon.stub(certificationCandidateSerializer, 'deserialize').resolves(certificationCandidate);
      sinon.stub(usecases, 'addCertificationCandidateToSession').withArgs({ sessionId, certificationCandidate }).resolves(addedCertificationCandidate);
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
        params: { id : sessionId, certificationCandidateId },
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

  describe('#getCertifications ', () => {
    let request;
    const sessionId = 1;
    const certifications = 'certifications';
    const certificationsJsonApi = 'certificationsJSONAPI';

    beforeEach(() => {
      // given
      request = {
        params: { id : sessionId },
        auth: {
          credentials : {
            userId,
          }
        },
      };
      sinon.stub(usecases, 'getSessionCertifications').withArgs({ sessionId }).resolves(certifications);
      sinon.stub(certificationResultSerializer, 'serialize').withArgs(certifications).returns(certificationsJsonApi);
    });

    it('should return certifications', async () => {
      // when
      const response = await sessionController.getCertifications(request, hFake);

      // then
      expect(response).to.deep.equal(certificationsJsonApi);
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
        params: { id : sessionId },
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

  describe('#createCandidateParticipation', () => {
    let request;
    const sessionId = 1;
    const userId = 2;
    const firstName = Symbol('firstName');
    const lastName = Symbol('lastName');
    const birthdate = Symbol('birthdate');
    const linkedCertificationCandidate = Symbol('candidate');
    const serializedCertificationCandidate = Symbol('sCandidate');

    beforeEach(() => {
      // given
      request = {
        params: { id : sessionId },
        auth: {
          credentials : {
            userId,
          }
        },
        payload: {
          data: {
            attributes: {
              'first-name': firstName,
              'last-name': lastName,
              'birthdate': birthdate,
            },
            type: 'certification-candidates',
          }
        }
      };
      sinon.stub(certificationCandidateSerializer, 'serialize').withArgs(linkedCertificationCandidate).returns(serializedCertificationCandidate);
    });

    context('when the participation already exists', () =>  {

      beforeEach(() => {
        sinon.stub(usecases, 'linkUserToSessionCertificationCandidate')
          .withArgs({ userId, sessionId, firstName, lastName, birthdate }).resolves({
            linkCreated: false,
            certificationCandidate: linkedCertificationCandidate
          });
      });

      it('should return a certification candidate', async () => {
        // when
        await sessionController.createCandidateParticipation(request, hFake);

        // then
        sinon.assert.calledOnce(certificationCandidateSerializer.serialize);
        sinon.assert.calledWith(certificationCandidateSerializer.serialize, linkedCertificationCandidate);
      });

    });

    context('when the participation is created', () => {

      beforeEach(() => {
        sinon.stub(usecases, 'linkUserToSessionCertificationCandidate')
          .withArgs({ userId, sessionId, firstName, lastName, birthdate }).resolves({
            linkCreated: true,
            certificationCandidate: linkedCertificationCandidate
          });
      });

      it('should return a certification candidate', async () => {
        // when
        const response = await sessionController.createCandidateParticipation(request, hFake);

        // then
        sinon.assert.calledOnce(certificationCandidateSerializer.serialize);
        sinon.assert.calledWith(certificationCandidateSerializer.serialize, linkedCertificationCandidate);
        expect(response.statusCode).to.equal(201);
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
      sinon.stub(sessionSerializer, 'serializeForFinalization').withArgs(updatedSession);
    });

    it('should call the finalizeSession usecase with correct values', async () => {
      // when
      await sessionController.finalize(request);

      // then
      expect(usecases.finalizeSession).to.have.been.calledWithExactly({ sessionId, examinerGlobalComment, certificationReports: [aCertificationReport] });
    });
  });

  describe('#updatePublication', () => {
    const sessionId = 123;
    const session = Symbol('session');
    const serializedSession = Symbol('serializedSession');

    beforeEach(() => {
      request = {
        params: {
          id: sessionId,
        },
        payload: {
          data: { attributes : {} }
        }
      };
    });

    context('when publishing', () => {

      beforeEach(() => {
        request.payload.data.attributes.toPublish = true;
        const usecaseResult = session;
        sinon.stub(usecases, 'updatePublicationSession').withArgs({ sessionId, toPublish: true }).resolves(usecaseResult);
        sinon.stub(sessionSerializer, 'serialize').withArgs(session).resolves(serializedSession);
      });

      it('should return the serialized session', async () => {
        // when
        const response = await sessionController.updatePublication(request);

        // then
        expect(response).to.equal(serializedSession);
      });

    });

    context('when unpublishing', () => {

      beforeEach(() => {
        request.payload.data.attributes.toPublish = false;
        const usecaseResult = session;
        sinon.stub(usecases, 'updatePublicationSession').withArgs({ sessionId, toPublish: false }).resolves(usecaseResult);
        sinon.stub(sessionSerializer, 'serialize').withArgs(session).resolves(serializedSession);
      });

      it('should return the serialized session', async () => {
        // when
        const response = await sessionController.updatePublication(request);

        // then
        expect(response).to.equal(serializedSession);
      });
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
      sinon.stub(sessionValidator, 'validateFilters');
      sinon.stub(jurySessionRepository, 'findPaginatedFiltered');
      sinon.stub(jurySessionSerializer, 'serialize');
    });

    context('when filters not are valid', () => {

      it('should pass an empty list of jury sessions with basic pagination to serializer', async () => {
        // given
        const request = { query: {} };
        const filter = { filter1: 'filter1', filter2: 'filter2' };
        const page = { number: 'aNumber', size: 'aSize' };
        queryParamsUtils.extractParameters.withArgs(request.query).returns({ filter, page });
        sessionValidator.validateFilters.withArgs(filter).throws();

        // when
        await sessionController.findPaginatedFilteredJurySessions(request, hFake);

        // then
        const expectedPagination = {
          page: page.number,
          pageSize: page.size,
          rowCount: 0,
          pageCount: 0,
        };
        expect(jurySessionRepository.findPaginatedFiltered.notCalled).to.be.true;
        expect(jurySessionSerializer.serialize).to.have.been.calledWithExactly([], expectedPagination);
      });
    });

    context('when filters are valid', () => {

      it('should pass the jurySessions and the pagination from the repository to the serializer', async () => {
        // given
        const request = { query: {} };
        const filter = { filter1: ' filter1ToTrim', filter2: 'filter2' };
        const normalizedFilters = 'normalizedFilters';
        const page = 'somePageConfiguration';
        const resolvedPagination = 'pagination';
        const matchingJurySessions = 'listOfMatchingJurySessions';
        queryParamsUtils.extractParameters.withArgs(request.query).returns({ filter, page });
        sessionValidator.validateFilters.withArgs({ filter1: 'filter1ToTrim', filter2: 'filter2' })
          .returns(normalizedFilters);
        jurySessionRepository.findPaginatedFiltered.withArgs({ filters: normalizedFilters, page })
          .resolves({ jurySessions: matchingJurySessions, pagination: resolvedPagination });
        jurySessionSerializer.serialize.returns({ data: {}, meta: {} });

        // when
        await sessionController.findPaginatedFilteredJurySessions(request, hFake);

        // then
        expect(jurySessionSerializer.serialize).to.have.been.calledWithExactly(matchingJurySessions, resolvedPagination);
      });
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
        params: { id : sessionId },
        auth: {
          credentials : {
            userId,
          }
        },
      };
      sinon.stub(usecases, 'assignCertificationOfficerToSession').withArgs({ sessionId, certificationOfficerId: userId }).resolves(session);
      sinon.stub(sessionSerializer, 'serialize').withArgs(session).returns(sessionJsonApi);
    });

    it('should return updated session', async () => {
      // when
      const response = await sessionController.assignCertificationOfficer(request, hFake);

      // then
      expect(usecases.assignCertificationOfficerToSession).to.have.been.calledWithExactly({ sessionId, certificationOfficerId: userId });
      expect(response).to.deep.equal(sessionJsonApi);
    });

  });
});
