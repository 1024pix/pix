const { expect, sinon } = require('../../../test-helper');
const CertificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const CertificationCourseBookshelf = require('../../../../lib/infrastructure/data/certification-course');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');

describe('Unit | Repository | Certification Course', function() {

  describe('#save', function() {

    let certificationCourse;
    let savedCertificationCourse;

    beforeEach(() => {
      certificationCourse = new CertificationCourse({ id: 'certifId', userId: 1, status: 'completed', completedAt: null, createdAt: null });
      savedCertificationCourse = new CertificationCourse({
        id: 'certifId',
        userId: 1,
        status: 'completed',
        completedAt: null,
        createdAt: null,
        type: 'CERTIFICATION',
        firstName: undefined,
        lastName: undefined,
        birthplace: undefined,
        birthdate: undefined,
        rejectionReason: undefined,
        challenges: [],
        assessment: {}
      });

      const certificationCourseBookshelf = new CertificationCourseBookshelf(certificationCourse);
      sinon.stub(CertificationCourseBookshelf.prototype, 'save').resolves(certificationCourseBookshelf);
    });

    afterEach(() => {
      CertificationCourseBookshelf.prototype.save.restore();
    });

    it('should save the certification-course', () => {
      // when
      const promise = CertificationCourseRepository.save(certificationCourse);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(CertificationCourseBookshelf.prototype.save);
      });

    });

    it('return the saved certification course in JSON ', () => {
      // when
      const promise = CertificationCourseRepository.save(certificationCourse);

      // then
      return promise.then((savedCertification) => {
        expect(savedCertification).to.deep.equal(savedCertificationCourse);
      });

    });
  });
});
