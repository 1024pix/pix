const {
  sinon,
  expect,
} = require('../../../test-helper');

const updatePublicationSession = require('../../../../lib/domain/usecases/update-publication-session');

describe('Unit | UseCase | publish-session', () => {

  let sessionId;
  let certificationRepository;

  beforeEach(async () => {
    sessionId = 123;
    certificationRepository = {
      updatePublicationStatusesBySessionId: sinon.stub(),
      updatePublicationStatuses: sinon.stub(),
    };
  });

  context('When we update publish session status', () => {

    [true, false].forEach((toPublish) =>
      it(`should update all certifications courses to ${toPublish ? 'publish' : 'unpublish'}`, async () => {
        // given
        certificationRepository.updatePublicationStatusesBySessionId.resolves();

        // when
        await updatePublicationSession({
          sessionId,
          toPublish,
          certificationRepository,
        });

        // then
        expect(certificationRepository.updatePublicationStatusesBySessionId).to.have.calledWithExactly(sessionId, toPublish);
      }));
  });

});
