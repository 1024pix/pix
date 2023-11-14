import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';
import { CertificationCourse } from '../../../../lib/domain/models/CertificationCourse.js';
import { correctCandidateIdentityInCertificationCourse } from '../../../../lib/domain/usecases/correct-candidate-identity-in-certification-course.js';
import { CpfBirthInformationValidation } from '../../../../src/certification/shared/domain/services/certification-cpf-service.js';
import { CertificationCandidatesError } from '../../../../lib/domain/errors.js';

describe('Unit | UseCase | correct-candidate-identity-in-certification-course', function () {
  let certificationCourseRepository;
  let certificationCpfService;
  let certificationCpfCountryRepository;
  let certificationCpfCityRepository;

  beforeEach(function () {
    certificationCourseRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };

    certificationCpfService = {
      getBirthInformation: sinon.stub(),
    };

    certificationCpfCountryRepository = Symbol('certificationCpfCountryRepository');
    certificationCpfCityRepository = Symbol('certificationCpfCityRepository');
  });

  it('it modifies the candidate', async function () {
    // given
    const sex = 'F';
    const birthCountry = 'FRANCE';
    const birthINSEECode = null;
    const birthCity = 'PARIS 15';
    const birthPostalCode = '75015';

    const certificationCourseToBeModified = domainBuilder.buildCertificationCourse({
      id: 4,
      firstName: 'Peter',
      lastName: 'Parker',
      birthdate: '1990-01-01',
      sex: 'M',
      birthplace: 'New York',
      birthCountry: 'ETATS-UNIS',
      birthINSEECode: '99404',
    });
    const cpfBirthInformationValidation = new CpfBirthInformationValidation();
    cpfBirthInformationValidation.success({ birthCountry, birthINSEECode, birthPostalCode, birthCity });

    certificationCourseRepository.get.withArgs(4).resolves(certificationCourseToBeModified);
    certificationCpfService.getBirthInformation
      .withArgs({
        birthCountry,
        birthCity,
        birthPostalCode,
        birthINSEECode,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
      })
      .resolves(cpfBirthInformationValidation);

    const command = {
      certificationCourseId: 4,
      firstName: 'Maurice',
      lastName: 'Dupont',
      birthdate: '2000-01-01',
      sex,
      birthplace: birthCity,
      birthINSEECode,
      birthCountry,
      birthPostalCode,
    };

    // when
    await correctCandidateIdentityInCertificationCourse({
      command,
      certificationCourseRepository,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
    });

    // then
    expect(certificationCourseRepository.update).to.have.been.calledWithExactly(
      new CertificationCourse({
        ...certificationCourseToBeModified.toDTO(),
        firstName: 'Maurice',
        lastName: 'Dupont',
        birthdate: '2000-01-01',
        sex: 'F',
        birthplace: 'PARIS 15',
        birthCountry: 'FRANCE',
        birthINSEECode: null,
        birthPostalCode: '75015',
      }),
    );
  });

  it('should throws a CertificationCandidatesError if birth information validation fails', async function () {
    // given
    const sex = 'F';
    const birthCountry = 'FRANCE';
    const birthINSEECode = null;
    const birthCity = 'PARIS 15';
    const birthPostalCode = '75015';

    const certificationCourseToBeModified = domainBuilder.buildCertificationCourse({
      id: 4,
      firstName: 'Peter',
      lastName: 'Parker',
      birthdate: '1990-01-01',
      sex: 'M',
      birthplace: 'New York',
      birthCountry: 'ETATS-UNIS',
      birthINSEECode: '99404',
    });

    certificationCourseRepository.get.withArgs(4).resolves(certificationCourseToBeModified);
    const certificationCandidateError = { code: '', getMessage: () => 'Failure message' };
    const cpfBirthInformationValidation = new CpfBirthInformationValidation();
    cpfBirthInformationValidation.failure({ certificationCandidateError });
    certificationCpfService.getBirthInformation
      .withArgs({
        birthCountry,
        birthCity,
        birthPostalCode,
        birthINSEECode,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
      })
      .resolves(cpfBirthInformationValidation);

    const command = {
      certificationCourseId: 4,
      firstName: 'Maurice',
      lastName: 'Dupont',
      birthdate: '2000-01-01',
      sex,
      birthplace: birthCity,
      birthINSEECode,
      birthCountry,
      birthPostalCode,
    };

    // when
    const error = await catchErr(correctCandidateIdentityInCertificationCourse)({
      command,
      certificationCourseRepository,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
    });

    // then
    expect(error).to.be.an.instanceOf(CertificationCandidatesError);
    expect(error.message).to.equal('Failure message');
  });
});
