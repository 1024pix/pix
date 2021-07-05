const { expect, sinon, domainBuilder } = require('../../../test-helper');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');

const modifyCandidateInCertificationCourse = require('../../../../lib/domain/usecases/modify-certification-candidate-in-certification-course');

describe('Unit | UseCase | modify-candidate-in-certification-course', () => {
  it('it modifies the candidate', async () => {
    // given
    const certificationCourseToBeModified = domainBuilder.buildCertificationCourse({
      id: 4,
      firstName: 'Peter',
      lastName: 'Parker',
      birthdate: '1990-01-01',
      birthplace: 'New York',
    });
    const certificationCourseRepository = {
      get: sinon.stub(),
      save: sinon.stub(),
    };
    certificationCourseRepository.get.withArgs(4).resolves(certificationCourseToBeModified);

    const command = {
      certificationCourseId: 4,
      firstName: 'Maurice',
      lastName: 'Dupont',
      birthdate: '2000-01-01',
      birthplace: 'Maubeuge',
    };

    // when
    await modifyCandidateInCertificationCourse({
      command,
      certificationCourseRepository,
    });

    // then
    expect(certificationCourseRepository.save).to.have.been.calledWith({
      certificationCourse: new CertificationCourse({
        ...certificationCourseToBeModified.toDTO(),
        firstName: 'Maurice',
        lastName: 'Dupont',
        birthdate: '2000-01-01',
        birthplace: 'Maubeuge',
      }),
    });
  });
});
