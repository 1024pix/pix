import { usecases as libUsecases } from '../../../../../lib/domain/usecases/index.js';
import { certificationCourseController } from '../../../../../src/certification/session-management/application/certification-course-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Session Management | Unit | Application | Controller | Certification Course', function () {
  describe('#update', function () {
    let certificationSerializer;
    const options = {
      method: 'PATCH',
      url: '/api/certification-courses/1245',
      params: {
        id: 4,
      },
      auth: {
        credentials: {
          userId: 54,
        },
      },
      payload: {
        data: {
          type: 'certifications',
          attributes: {
            id: '1',
            firstName: 'Phil',
            lastName: 'Defer',
            birthplace: 'Not here nor there',
            birthdate: '2020-01-01',
            status: 'rejected',
            birthCountry: 'Kazakhstan',
            birthINSEECode: '99505',
            birthPostalCode: '12345',
            sex: 'M',
          },
        },
      },
    };

    beforeEach(function () {
      certificationSerializer = {
        serializeFromCertificationCourse: sinon.stub(),
        deserializeCertificationCandidateModificationCommand: sinon.stub(),
        deserialize: sinon.stub(),
      };
    });

    it('should modify the certification course candidate ', async function () {
      // given
      sinon.stub(usecases, 'correctCandidateIdentityInCertificationCourse').resolves();
      const updatedCertificationCourse = domainBuilder.buildCertificationCourse();
      sinon.stub(libUsecases, 'getCertificationCourse').resolves(updatedCertificationCourse);
      certificationSerializer.deserializeCertificationCandidateModificationCommand.resolves({
        firstName: 'Phil',
        lastName: 'Defer',
        birthplace: 'Not here nor there',
        birthdate: '2020-01-01',
        userId: 54,
        certificationCourseId: 4,
        birthCountry: 'Kazakhstan',
        birthPostalCode: '12345',
        sex: 'M',
        birthINSEECode: '99505',
      });
      certificationSerializer.serializeFromCertificationCourse.returns('ok');

      // when
      await certificationCourseController.update(options, hFake, { certificationSerializer });

      // then
      expect(usecases.correctCandidateIdentityInCertificationCourse).to.have.been.calledWithExactly({
        command: {
          firstName: 'Phil',
          lastName: 'Defer',
          birthplace: 'Not here nor there',
          birthdate: '2020-01-01',
          userId: 54,
          certificationCourseId: 4,
          birthCountry: 'Kazakhstan',
          birthPostalCode: '12345',
          sex: 'M',
          birthINSEECode: '99505',
        },
      });
    });

    context('when certification course was modified', function () {
      it('should serialize and return saved certification course', async function () {
        // given
        sinon.stub(usecases, 'correctCandidateIdentityInCertificationCourse').resolves();
        const updatedCertificationCourse = domainBuilder.buildCertificationCourse();
        sinon.stub(libUsecases, 'getCertificationCourse').resolves(updatedCertificationCourse);
        certificationSerializer.deserializeCertificationCandidateModificationCommand.resolves({
          firstName: 'Phil',
          lastName: 'Defer',
          birthplace: 'Not here nor there',
          birthdate: '2020-01-01',
          userId: 54,
          certificationCourseId: 4,
          birthCountry: 'Kazakhstan',
          birthPostalCode: '12345',
          sex: 'M',
          birthINSEECode: '99505',
        });
        certificationSerializer.serializeFromCertificationCourse.returns('ok');

        // when
        const response = await certificationCourseController.update(options, hFake, { certificationSerializer });

        // then
        expect(response).to.deep.equal('ok');
      });
    });
  });
});
