const {
  sinon,
  expect,
  catchErr,
} = require('../../../test-helper');

const finalizeSession = require('../../../../lib/domain/usecases/finalize-session');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');
const { SessionAlreadyFinalizedError, InvalidCertificationCourseForFinalization } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | finalize-session', () => {

  let sessionId;
  let updatedSession;
  let examinerGlobalComment;
  let sessionRepository;
  let certificationCourseRepository;

  beforeEach(async () => {
    sessionId = 'dummy session id';
    updatedSession = Symbol('updated session');
    examinerGlobalComment = 'It was a fine session my dear.';
    sessionRepository = {
      updateStatusAndExaminerGlobalComment: sinon.stub(),
      isFinalized: sinon.stub(),
    };
    certificationCourseRepository = {
      finalizeAll: sinon.stub(),
    };
  });

  context('When the session status is already finalized', () => {

    beforeEach(() => {
      sessionRepository.isFinalized.withArgs(sessionId).resolves(true);
    });

    it('should throw a SessionAlreadyFinalizedError error', async () => {
      // when
      const err = await catchErr(finalizeSession)({
        sessionId,
        examinerGlobalComment,
        sessionRepository,
        certificationCourses: [],
        certificationCourseRepository
      });

      // then
      expect(err).to.be.instanceOf(SessionAlreadyFinalizedError);
    });

  });

  context('When the session status is not finalized yet ', () => {
    let certificationCourses;
    context('When the certificationCourses are not valid', () => {
      beforeEach(() => {
        const courseWithoutHasSeenLastScreen = new CertificationCourse();
        certificationCourses = [courseWithoutHasSeenLastScreen];
      });

      it('should throw an InvalidCertificationCourseForFinalization error', async () => {
        // when
        const err = await catchErr(finalizeSession)({
          sessionId,
          examinerGlobalComment,
          sessionRepository,
          certificationCourses,
          certificationCourseRepository
        });

        // then
        expect(err).to.be.instanceOf(InvalidCertificationCourseForFinalization);
      });
    });

    context('When the certificationCourses are valid', () => {
      beforeEach(() => {
        const validCourseForFinalization = new CertificationCourse({
          birthdate: '2000-10-01',
          examinerComment: 'signalement sur le candidat',
          hasSeenEndTestScreen: false,
        });
        certificationCourses = [validCourseForFinalization];
        sessionRepository.isFinalized.withArgs(sessionId).resolves(false);
        certificationCourseRepository.finalizeAll.withArgs(certificationCourses).resolves();
        sessionRepository.updateStatusAndExaminerGlobalComment.withArgs({
          id: sessionId,
          status: 'finalized',
          examinerGlobalComment,
        }).resolves(updatedSession);
      });

      it('should return the updated session', async () => {
        // when
        const res = await finalizeSession({
          sessionId,
          examinerGlobalComment,
          sessionRepository,
          certificationCourses,
          certificationCourseRepository,
        });

        // then
        expect(res).to.deep.equal(updatedSession);
      });
    });

  });

});
