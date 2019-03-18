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
        assessmentResults: [],
      });

      // then
      expect(certification.pixScore).to.be.undefined;
      expect(certification.status).to.be.undefined;
      expect(certification.commentForCandidate).to.be.undefined;
    });

    it('should return the pixScore and status of the last AssessmentResult', () => {
      // given
      const assessmentResult1 = new AssessmentResult({
        pixScore: 35,
        status: 'validated',
        createdAt: new Date('2017-02-15T14:59:35Z'),
        commentForCandidate: 'Vous auriez dû travailler plus.',
      });
      const assessmentResult2 = new AssessmentResult({
        pixScore: 20,
        status: 'validated',
        createdAt: new Date('2018-02-15T14:59:35Z'),
        commentForCandidate: 'Vous auriez vraiment dû travailler plus.',
      });

      // when
      const certification = new Certification({
        id: 1,
        date: new Date('2018-01-12T01:02:03Z'),
        certificationCenter: 'certificationCenter',
        isPublished: 'isPublished',
        assessmentResults: [assessmentResult1, assessmentResult2],
      });

      // then
      expect(certification.pixScore).to.equal(20);
      expect(certification.status).to.equal('validated');
      expect(certification.commentForCandidate).to.equal('Vous auriez vraiment dû travailler plus.');
    });

  });
});
