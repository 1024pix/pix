const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | analyze-attendance-sheet', () => {

  describe('#analyzeAttendanceSheet', () => {
    it('should analyze attendanceSheet', async () => {
      // given
      const anOdsBuffer = Symbol('an ods buffer');
      const certificationsOdsService = require('../../../../lib/domain/services/certifications-ods-service');
      const aCertification = {};
      const listOfCertificationsFromOds = [aCertification];
      const expectedListOfCertifications = [{
        ...aCertification,
      }];

      sinon.stub(certificationsOdsService,'extractCertificationsDataFromAttendanceSheet')
        .withArgs({ odsBuffer: anOdsBuffer })
        .resolves(listOfCertificationsFromOds);

      // when
      const result = await usecases.analyzeAttendanceSheet({
        odsBuffer: anOdsBuffer,
        certificationsOdsService,
      });

      // then
      expect(result).to.deep.equal(expectedListOfCertifications);
    });
  });
});
