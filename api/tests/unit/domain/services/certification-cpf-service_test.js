const { expect, sinon, domainBuilder } = require('../../../test-helper');
const {
  CpfBirthInformationValidation,
  getBirthInformation,
} = require('../../../../lib/domain/services/certification-cpf-service');
const { CERTIFICATION_CANDIDATES_ERRORS } = require('../../../../lib/domain/constants/certification-candidates-errors');

describe('Unit | Service | Certification CPF service', function () {
  let certificationCpfCountryRepository;
  let certificationCpfCityRepository;

  beforeEach(function () {
    certificationCpfCountryRepository = {
      getByMatcher: sinon.stub(),
    };
    certificationCpfCityRepository = {
      findByINSEECode: sinon.stub(),
      findByPostalCode: sinon.stub(),
    };
  });

  describe('#getBirthInformation', function () {
    context('when country name is not defined', function () {
      it('should return a validation failure', async function () {
        // when
        const result = await getBirthInformation({
          birthCountry: null,
          birthCity: 'GOTHAM CITY',
          birthPostalCode: '12345',
          birthINSEECode: '12345',
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
        });

        // then
        expect(result).to.deep.equal(
          CpfBirthInformationValidation.failure({
            certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_COUNTRY_REQUIRED,
          })
        );
      });
    });

    context('when country does not exist', function () {
      it('should return a validation failure', async function () {
        // given
        const birthCountry = 'ABCD';
        const birthCity = 'GOTHAM CITY';
        const birthPostalCode = null;
        const birthINSEECode = '12345';

        certificationCpfCountryRepository.getByMatcher.resolves(null);

        // when
        const result = await getBirthInformation({
          birthCountry,
          birthCity,
          birthPostalCode,
          birthINSEECode,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
        });

        // then
        expect(result).to.deep.equal(
          CpfBirthInformationValidation.failure({
            certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_COUNTRY_NOT_FOUND,
            data: { birthCountry },
          })
        );
      });
    });

    context('when country exists', function () {
      context('when country is not FRANCE', function () {
        it('should return a validation failure when city name is not defined', async function () {
          // given
          const birthCountry = 'PORTUGAL';
          const birthCity = null;
          const birthPostalCode = null;
          const birthINSEECode = '99';

          const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry({
            code: '1234',
            name: 'PORTUGAL',
          });

          certificationCpfCountryRepository.getByMatcher
            .withArgs({ matcher: 'AGLOPRTU' })
            .resolves(certificationCPFCountry);

          // when
          const result = await getBirthInformation({
            birthCountry,
            birthCity,
            birthPostalCode,
            birthINSEECode,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
          });

          // then
          expect(result).to.deep.equal(
            CpfBirthInformationValidation.failure({
              certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_CITY_REQUIRED,
            })
          );
        });

        it('should return a validation failure when postal code is defined', async function () {
          // given
          const birthCountry = 'PORTUGAL';
          const birthCity = 'Porto';
          const birthPostalCode = '1234';
          const birthINSEECode = null;

          const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry({
            code: '1234',
            name: 'PORTUGAL',
          });

          certificationCpfCountryRepository.getByMatcher
            .withArgs({ matcher: 'AGLOPRTU' })
            .resolves(certificationCPFCountry);

          // when
          const result = await getBirthInformation({
            birthCountry,
            birthCity,
            birthPostalCode,
            birthINSEECode,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
          });

          // then
          expect(result).to.deep.equal(
            CpfBirthInformationValidation.failure({
              certificationCandidateError:
                CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_POSTAL_CODE_ON_FOREIGN_COUNTRY_MUST_BE_EMPTY,
            })
          );
        });

        it('should return a validation failure when INSEE code is not defined', async function () {
          // given
          const birthCountry = 'PORTUGAL';
          const birthCity = 'Porto';
          const birthPostalCode = null;
          const birthINSEECode = null;

          const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry({
            code: '1234',
            name: 'PORTUGAL',
          });

          certificationCpfCountryRepository.getByMatcher
            .withArgs({ matcher: 'AGLOPRTU' })
            .resolves(certificationCPFCountry);

          // when
          const result = await getBirthInformation({
            birthCountry,
            birthCity,
            birthPostalCode,
            birthINSEECode,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
          });

          // then
          expect(result).to.deep.equal(
            CpfBirthInformationValidation.failure({
              certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_FOREIGN_INSEE_CODE_NOT_VALID,
            })
          );
        });

        it('should return a validation failure when INSEE code is not 99', async function () {
          // given
          const birthCountry = 'PORTUGAL';
          const birthCity = 'Porto';
          const birthPostalCode = null;
          const birthINSEECode = '1234';

          const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry({
            code: '1234',
            name: 'PORTUGAL',
          });

          certificationCpfCountryRepository.getByMatcher
            .withArgs({ matcher: 'AGLOPRTU' })
            .resolves(certificationCPFCountry);

          // when
          const result = await getBirthInformation({
            birthCountry,
            birthCity,
            birthPostalCode,
            birthINSEECode,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
          });

          // then
          expect(result).to.deep.equal(
            CpfBirthInformationValidation.failure({
              certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_FOREIGN_INSEE_CODE_NOT_VALID,
            })
          );
        });

        it('should return birth information when city name is defined', async function () {
          // given
          const birthCountry = 'PORTUGAL';
          const birthCity = 'Porto';
          const birthPostalCode = null;
          const birthINSEECode = '99';

          const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry({
            code: '1234',
            name: 'PORTUGAL',
          });

          certificationCpfCountryRepository.getByMatcher
            .withArgs({ matcher: 'AGLOPRTU' })
            .resolves(certificationCPFCountry);

          // when
          const result = await getBirthInformation({
            birthCountry,
            birthCity,
            birthPostalCode,
            birthINSEECode,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
          });

          // then
          expect(result).to.deep.equal(
            CpfBirthInformationValidation.success({
              birthCountry: 'PORTUGAL',
              birthINSEECode: '1234',
              birthPostalCode: null,
              birthCity: 'Porto',
            })
          );
        });
      });

      context('when country is FRANCE', function () {
        context('when postal code and INSEE code are not defined', function () {
          it('should return a validation failure', async function () {
            // given
            const birthCountry = 'FRANCE';
            const birthCity = null;
            const birthPostalCode = null;
            const birthINSEECode = null;

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
            certificationCpfCountryRepository.getByMatcher
              .withArgs({ matcher: 'ACEFNR' })
              .resolves(certificationCPFCountry);

            // when
            const result = await getBirthInformation({
              birthCountry,
              birthCity,
              birthPostalCode,
              birthINSEECode,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(
              CpfBirthInformationValidation.failure({
                certificationCandidateError:
                  CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_INSEE_CODE_OR_BIRTH_POSTAL_CODE_REQUIRED,
              })
            );
          });
        });

        context('when both postal code and INSEE code are defined', function () {
          it('should return a validation failure', async function () {
            // given
            const birthCountry = 'FRANCE';
            const birthCity = null;
            const birthPostalCode = '1234';
            const birthINSEECode = '1234';

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
            certificationCpfCountryRepository.getByMatcher
              .withArgs({ matcher: 'ACEFNR' })
              .resolves(certificationCPFCountry);

            // when
            const result = await getBirthInformation({
              birthCountry,
              birthCity,
              birthPostalCode,
              birthINSEECode,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(
              CpfBirthInformationValidation.failure({
                certificationCandidateError:
                  CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_INSEE_CODE_OR_BIRTH_POSTAL_CODE_REQUIRED,
              })
            );
          });
        });

        context('when INSEE code is provided', function () {
          it('should return birth information when INSEE code is valid', async function () {
            // given
            const birthCountry = 'FRANCE';
            const birthCity = null;
            const birthPostalCode = null;
            const birthINSEECode = '12345';

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
            const certificationCPFCity = domainBuilder.buildCertificationCpfCity({
              birthINSEECode,
              name: 'GOTHAM CITY',
            });

            certificationCpfCountryRepository.getByMatcher
              .withArgs({ matcher: 'ACEFNR' })
              .resolves(certificationCPFCountry);
            certificationCpfCityRepository.findByINSEECode.resolves([certificationCPFCity]);

            // when
            const result = await getBirthInformation({
              birthCountry,
              birthCity,
              birthPostalCode,
              birthINSEECode,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(
              CpfBirthInformationValidation.success({
                birthCountry: 'FRANCE',
                birthINSEECode: '12345',
                birthPostalCode: null,
                birthCity: 'GOTHAM CITY',
              })
            );
            expect(certificationCpfCityRepository.findByINSEECode).to.have.been.calledWith({
              INSEECode: birthINSEECode,
            });
          });

          it('should return a validation failure when INSEE code is not valid', async function () {
            // given
            const birthCountry = 'FRANCE';
            const birthCity = null;
            const birthPostalCode = null;
            const birthINSEECode = '12345';

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();

            certificationCpfCountryRepository.getByMatcher
              .withArgs({ matcher: 'ACEFNR' })
              .resolves(certificationCPFCountry);
            certificationCpfCityRepository.findByINSEECode.resolves([]);

            // when
            const result = await getBirthInformation({
              birthCountry,
              birthCity,
              birthPostalCode,
              birthINSEECode,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(
              CpfBirthInformationValidation.failure({
                certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_INSEE_CODE_NOT_VALID,
                data: { birthINSEECode },
              })
            );
          });

          it('should return a validation failure when birth city is provided along with INSEE code', async function () {
            // given
            const birthCountry = 'FRANCE';
            const birthCity = 'GOTHAM CITY';
            const birthPostalCode = null;
            const birthINSEECode = '12345';

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();

            certificationCpfCountryRepository.getByMatcher
              .withArgs({ matcher: 'ACEFNR' })
              .resolves(certificationCPFCountry);
            certificationCpfCityRepository.findByINSEECode.resolves([]);

            // when
            const result = await getBirthInformation({
              birthCountry,
              birthCity,
              birthPostalCode,
              birthINSEECode,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(
              CpfBirthInformationValidation.failure({
                certificationCandidateError:
                  CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_INSEE_CODE_OR_BIRTH_POSTAL_CODE_REQUIRED,
              })
            );
          });
        });

        context('when postal code is provided', function () {
          it('should return birth information when postal code is valid', async function () {
            // given
            const birthCountry = 'FRANCE';
            const birthCity = 'GOTHAM CITY';
            const birthPostalCode = '12345';
            const birthINSEECode = null;

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
            const certificationCPFCity = domainBuilder.buildCertificationCpfCity({
              birthPostalCode,
              name: 'GOTHAM CITY',
            });

            certificationCpfCountryRepository.getByMatcher
              .withArgs({ matcher: 'ACEFNR' })
              .resolves(certificationCPFCountry);
            certificationCpfCityRepository.findByPostalCode.resolves([certificationCPFCity]);

            // when
            const result = await getBirthInformation({
              birthCountry,
              birthCity,
              birthPostalCode,
              birthINSEECode,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(
              CpfBirthInformationValidation.success({
                birthCountry: 'FRANCE',
                birthINSEECode: null,
                birthPostalCode: '12345',
                birthCity: 'GOTHAM CITY',
              })
            );
            expect(certificationCpfCityRepository.findByPostalCode).to.have.been.calledWith({
              postalCode: birthPostalCode,
            });
          });

          context('when there is multiple cities for the same postal code', function () {
            it('should return birth information with the normalized provided city name', async function () {
              // given
              const birthCountry = 'FRANCE';
              const birthCity = 'Losse-en-Gelaisse';
              const birthPostalCode = '12345';
              const birthINSEECode = null;

              const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
              certificationCpfCountryRepository.getByMatcher
                .withArgs({ matcher: 'ACEFNR' })
                .resolves(certificationCPFCountry);
              certificationCpfCityRepository.findByPostalCode.resolves([
                domainBuilder.buildCertificationCpfCity({
                  birthPostalCode,
                  name: 'NOUILLORC',
                  isActualName: true,
                }),
                domainBuilder.buildCertificationCpfCity({
                  birthPostalCode,
                  name: 'LOSSE EN GELAISSE',
                  isActualName: true,
                }),
              ]);

              // when
              const result = await getBirthInformation({
                birthCountry,
                birthCity,
                birthPostalCode,
                birthINSEECode,
                certificationCpfCountryRepository,
                certificationCpfCityRepository,
              });

              // then
              expect(result).to.deep.equal(
                CpfBirthInformationValidation.success({
                  birthCountry: 'FRANCE',
                  birthINSEECode: null,
                  birthPostalCode: '12345',
                  birthCity: 'LOSSE EN GELAISSE',
                })
              );
              expect(certificationCpfCityRepository.findByPostalCode).to.have.been.calledWith({
                postalCode: birthPostalCode,
              });
            });
          });

          it('should return a validation failure when postal code is not valid', async function () {
            // given
            const birthCountry = 'FRANCE';
            const birthCity = 'GOTHAM CITY';
            const birthPostalCode = '12345';
            const birthINSEECode = null;

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();

            certificationCpfCountryRepository.getByMatcher
              .withArgs({ matcher: 'ACEFNR' })
              .resolves(certificationCPFCountry);
            certificationCpfCityRepository.findByPostalCode.resolves([]);

            // when
            const result = await getBirthInformation({
              birthCountry,
              birthCity,
              birthPostalCode,
              birthINSEECode,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(
              CpfBirthInformationValidation.failure({
                certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_POSTAL_CODE_NOT_FOUND,
                data: { birthPostalCode },
              })
            );
          });

          it('should return a validation failure when birth city is not defined', async function () {
            // given
            const birthCountry = 'FRANCE';
            const birthCity = null;
            const birthPostalCode = '12345';
            const birthINSEECode = null;

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
            certificationCpfCountryRepository.getByMatcher
              .withArgs({ matcher: 'ACEFNR' })
              .resolves(certificationCPFCountry);

            // when
            const result = await getBirthInformation({
              birthCountry,
              birthCity,
              birthPostalCode,
              birthINSEECode,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(
              CpfBirthInformationValidation.failure({
                certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_CITY_REQUIRED,
              })
            );
          });

          it('should return a validation failure when postal code does not match city name', async function () {
            // given
            const birthCountry = 'FRANCE';
            const birthCity = 'METROPOLIS';
            const birthPostalCode = '12345';
            const birthINSEECode = null;

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();

            const certificationCPFCity = domainBuilder.buildCertificationCpfCity({
              birthPostalCode,
              name: 'GOTHAM CITY',
            });

            certificationCpfCountryRepository.getByMatcher
              .withArgs({ matcher: 'ACEFNR' })
              .resolves(certificationCPFCountry);
            certificationCpfCityRepository.findByPostalCode.resolves([certificationCPFCity]);

            // when
            const result = await getBirthInformation({
              birthCountry,
              birthCity,
              birthPostalCode,
              birthINSEECode,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(
              CpfBirthInformationValidation.failure({
                certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_POSTAL_CODE_CITY_NOT_VALID,
                data: { birthPostalCode, birthCity },
              })
            );
          });
        });
      });
    });
  });
});
