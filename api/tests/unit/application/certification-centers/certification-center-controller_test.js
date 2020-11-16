const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');

const certificationCenterController = require('../../../../lib/application/certification-centers/certification-center-controller');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | certifications-center-controller', () => {

  describe('#getStudents', () => {

    it('should return a paginated serialized list of students', async () => {
      // given
      const student = domainBuilder.buildSchoolingRegistration();

      const request = {
        auth: {
          credentials: { userId: '111' },
        },
        params: {
          certificationCenterId: '99',
          sessionId: '88',
        },
      };
      const expectedSerializedStudents = { data: [{
        'attributes': {
          'birthdate': student.birthdate,
          'division': student.division,
          'first-name': student.firstName,
          'last-name': student.lastName,
        },
        'id': student.id + '',
        'type': 'students',
      }] };

      sinon
        .stub(usecases, 'findStudentsForEnrollement')
        .withArgs({ userId: 111, certificationCenterId: 99, sessionId: 88 })
        .resolves([student]);

      // when
      const response = await certificationCenterController.getStudents(request, hFake);

      // then
      expect(response).to.deep.equal(expectedSerializedStudents);
    });
  });

});
