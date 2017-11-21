const { expect, describe, beforeEach, afterEach, it, sinon } = require('../../../test-helper');
const CertificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const CertificationCourse = require('../../../../lib/domain/models/data/certification-course');

describe('Unit | Repository | Certification Course', function() {

  describe('#save', function() {

    let certificationCourse;

    beforeEach(() => {
      certificationCourse = { id: 'certifId' };
      const certificationCourseBookshelf = new CertificationCourse(certificationCourse);
      sinon.stub(CertificationCourse.prototype, 'save').resolves(certificationCourseBookshelf);
    });

    afterEach(() => {
      CertificationCourse.prototype.save.restore();
    });

    it('should save the certification-course', function() {
      // when
      const promise = CertificationCourseRepository.save();

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(CertificationCourse.prototype.save);
      });

    });

    it('return the saved certification course in JSON ', function() {
      // when
      const promise = CertificationCourseRepository.save();

      // then
      return promise.then((savedCertification) => {
        expect(savedCertification).to.deep.equal(certificationCourse);
      });

    });
  });
});
