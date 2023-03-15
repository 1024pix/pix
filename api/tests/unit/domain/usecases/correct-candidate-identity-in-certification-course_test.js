const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const CertificationCourse = require('../../../../lib/domain/models/CertificationCourse');

const correctCandidateIdentityInCertificationCourse = require('../../../../lib/domain/usecases/correct-candidate-identity-in-certification-course');
const { CpfBirthInformationValidation } = require('../../../../lib/domain/services/certification-cpf-service');
const { CpfBirthInformationValidationError } = require('../../../../lib/domain/errors');

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
      .resolves(CpfBirthInformationValidation.success({ birthCountry, birthINSEECode, birthPostalCode, birthCity }));

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
    expect(certificationCourseRepository.update).to.have.been.calledWith(
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
      })
    );
  });

  it('should throws a CpfBirthInformationValidationError if birth information validation fails', async function () {
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
    certificationCpfService.getBirthInformation
      .withArgs({
        birthCountry,
        birthCity,
        birthPostalCode,
        birthINSEECode,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
      })
      .resolves(CpfBirthInformationValidation.failure({ certificationCandidateError }));

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
    expect(error).to.be.an.instanceOf(CpfBirthInformationValidationError);
    expect(error.message).to.equal('Failure message');
  });
});
