const { expect, sinon } = require('../../../test-helper');
const CertificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const CertificationCourseBookshelf = require('../../../../lib/infrastructure/data/certification-course');

const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Unit | Repository | Certification Course', function() {

  describe('#save', function() {

    let certificationCourse;
    let savedCertificationCourse;

    beforeEach(() => {
      certificationCourse = CertificationCourse.fromAttributes({
        id: 'certifId',
        userId: 1,
        completedAt: null,
        createdAt: null,
        firstName: 'Antoine',
        lastName: 'Griezmann',
        birthplace: 'Macon',
        birthdate: '21/03/1991',
        sessionId: 'EURO2016',
        externalId: 'xenoverse2'
      });
      savedCertificationCourse = CertificationCourse.fromAttributes({
        id: 'certifId',
        userId: 1,
        completedAt: null,
        createdAt: null,
        type: Assessment.types.CERTIFICATION,
        firstName: 'Antoine',
        lastName: 'Griezmann',
        birthplace: 'Macon',
        birthdate: '21/03/1991',
        challenges: [],
        assessment: {},
        sessionId: 'EURO2016',
        externalId: 'xenoverse2'
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
