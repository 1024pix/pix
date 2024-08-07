import { enrolmentController } from '../../../../../src/certification/enrolment/application/enrolment-controller.js';
import { usecases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Controller | enrolment-controller', function () {
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
      sinon.stub(usecases, 'getEnrolledCandidatesInSession');
      const enrolledCandidateSerializer = { serialize: sinon.stub() };
      dependencies = {
        requestResponseUtils,
        enrolledCandidateSerializer,
      };
    });

    context('when the user has access to session and there organizationLearnerIds are corrects', function () {
      beforeEach(function () {
        dependencies.requestResponseUtils.extractUserIdFromRequest.withArgs(request).returns(userId);
        usecases.enrolStudentsToSession.withArgs({ sessionId, referentId: userId, studentIds }).resolves();
        usecases.getEnrolledCandidatesInSession.withArgs({ sessionId }).resolves(studentList);
        dependencies.enrolledCandidateSerializer.serialize
          .withArgs(studentList)
          .returns(serializedCertificationCandidate);
      });

      it('should return certificationCandidates', async function () {
        // when
        const response = await enrolmentController.enrolStudentsToSession(request, hFake, dependencies);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.source).to.deep.equal(serializedCertificationCandidate);
      });
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
      await enrolmentController.importCertificationCandidatesFromCandidatesImportSheet(request);

      // then
      expect(usecases.importCertificationCandidatesFromCandidatesImportSheet).to.have.been.calledWithExactly({
        sessionId,
        odsBuffer,
        i18n: request.i18n,
      });
    });
  });
});
