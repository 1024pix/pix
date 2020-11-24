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
        query: { 'page[size]': 10, 'page[number]': 1 },
      };

      sinon
        .stub(usecases, 'findStudentsForEnrollement')
        .withArgs({ userId: 111, certificationCenterId: 99, sessionId: 88, page: { size: 10, number: 1 } })
        .resolves({
          data: [student],
          pagination: { page: 1, pageSize: 10, rowCount: 1, pageCount: 1 },
        });

      // when
      const response = await certificationCenterController.getStudents(request, hFake);

      // then
      expect(response).to.deep.equal(
        {
          data: [{
            'attributes': {
              'birthdate': student.birthdate,
              'division': student.division,
              'first-name': student.firstName,
              'last-name': student.lastName,
            },
            'id': `${student.id}`,
            'type': 'students',

          }],
          meta: { page: 1, pageSize: 10, rowCount: 1, pageCount: 1 },
        },
      );
    });
  });

});
