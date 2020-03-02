const {
  sinon,
  expect,
} = require('../../../test-helper');

const updatePublicationSession = require('../../../../lib/domain/usecases/update-publication-session');

describe('Unit | UseCase | publish-session', () => {

  let sessionId;
  let certificationCourseRepository;

  beforeEach(async () => {
    sessionId = 123;
    certificationCourseRepository = {
      findIdsBySessionId: sinon.stub(),
      update: sinon.stub(),
    };
  });

  context('When session has no certification courses', () => {

    it('should not update certifications', async () => {
      // given
      const toPublish = true;
      certificationCourseRepository.findIdsBySessionId.resolves([]);

      // when
      await updatePublicationSession({
        sessionId,
        toPublish,
        certificationCourseRepository,
      });

      // then
      expect(certificationCourseRepository.findIdsBySessionId).to.have.been.calledWithExactly(sessionId);
      expect(certificationCourseRepository.update).to.have.been.not.called;
    });

  });

  context('When session has certifications courses', () => {

    [true, false].forEach((toPublish) =>
      it(`should update all certifications courses to ${toPublish ? 'publish' : 'unpublish'}`, async () => {
      // given
        const certifCourse1 = 123;
        const certifCourse2 = 456;
        certificationCourseRepository.findIdsBySessionId.resolves([certifCourse1, certifCourse2]);
        certificationCourseRepository.update.resolves();

        // when
        await updatePublicationSession({
          sessionId,
          toPublish,
          certificationCourseRepository,
        });

        // then
        expect(certificationCourseRepository.findIdsBySessionId).to.have.been.calledWithExactly(sessionId);
        expect(certificationCourseRepository.update).to.have.been.calledTwice;
        sinon.assert.calledWith(certificationCourseRepository.update.firstCall, { id: certifCourse1,
          isPublished: toPublish });
        sinon.assert.calledWith(certificationCourseRepository.update.secondCall, { id: certifCourse2,
          isPublished: toPublish });
      }));
  });

});
