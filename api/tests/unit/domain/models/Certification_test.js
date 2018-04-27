const Certification = require('../../../../lib/domain/models/Certification');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | Certification', () => {

  describe('#constructor', () => {

    it('should set pix score at undefined when there are assessment results', () => {
      // when
      const certification = new Certification({
        id: 1,
        date: 'date',
        certificationCenter: 'certificationCenter',
        isPublished: 'isPublished',
        assessmentResults: []
      });

      // then
      expect(certification.pixScore).to.be.undefined;
      expect(certification.status).to.be.undefined;
    });

    it('should return the pixScore and status of the last AssessmentResult', () => {
      // given
      const assessmentResult1 = new AssessmentResult({
        pixScore : 35,
        status: 'validated',
        createdAt: '2017-02-15 14:59:35'
      });
      const assessmentResult2 = new AssessmentResult({
        pixScore : 20,
        status: 'validated',
        createdAt: '2018-02-15 14:59:35'
      });

      // when
      const certification = new Certification({
        id: 1,
        date: '12/01/2018',
        certificationCenter: 'certificationCenter',
        isPublished: 'isPublished',
        assessmentResults: [assessmentResult1, assessmentResult2]
      });

      // then
      expect(certification.pixScore).to.equal(20);
      expect(certification.status).to.equal('validated');
    });

  });
});
