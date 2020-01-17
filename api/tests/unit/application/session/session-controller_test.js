const { expect, sinon, hFake } = require('../../../test-helper');

const sessionController = require('../../../../lib/application/sessions/session-controller');
const usecases = require('../../../../lib/domain/usecases');
const Session = require('../../../../lib/domain/models/Session');

const sessionSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/session-serializer');
const certificationCandidateSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-candidate-serializer');
const certificationResultSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-result-serializer');
const _ = require('lodash');

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

  describe('#update ', () => {
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

  describe('#getAttendanceSheet ', () => {
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

  describe('#getCertificationCandidates ', () => {
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

  describe('#createCandidateParticipation ', () => {
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

  describe('#finalize ', () => {
    let request;
    const sessionId = 1;
    const updatedSession = Symbol('updatedSession');
    const serializedUpdatedSession = Symbol('updated session serialized');
    const examinerGlobalComment = 'It was a fine session my dear';
    const serializedCertificationCourses = [
      {
        id: 1,
        type: 'certification-courses',
        attributes: {
          birthdate: '2019-01-01',
          'has-seen-end-test-screen': false,
          'examiner-comment': 'What a fine lad this one',
        },
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
            included: serializedCertificationCourses,
          },
        },
      };

      sinon.stub(usecases, 'finalizeSession').resolves(updatedSession);
      sinon.stub(sessionSerializer, 'serializeForFinalization').withArgs(updatedSession).resolves(serializedUpdatedSession);
    });

    it('should return the updated version of the session', async () => {
      // when
      const response = await sessionController.finalize(request);

      // then
      expect(response).to.deep.equal(serializedUpdatedSession);
    });
  });

  describe('#analyzeFromAttendanceSheet', () => {
    const sessionId = 3;

    let request;
    const odsBuffer = 'File Buffer';
    beforeEach(() => {
      // given
      request = {
        params: {
          id: sessionId,
        },
        payload: { file: odsBuffer },
      };

      sinon.stub(usecases, 'analyzeAttendanceSheet').resolves();
    });

    it('should return certifications data for PV analysis', async () => {
      // given
      const analyzeResult = Symbol('attendance sheet analyze result');
      usecases.analyzeAttendanceSheet.resolves(analyzeResult);

      // when
      const result = await sessionController.analyzeAttendanceSheet(request);

      // then
      expect(result).to.equal(analyzeResult);
    });
  });

});
