import { expect, sinon, domainBuilder } from '../../../../../test-helper.js';
import {
  CpfBirthInformationValidation,
  getBirthInformation,
} from '../../../../../../src/certification/shared/domain/services/certification-cpf-service.js';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../../lib/domain/constants/certification-candidates-errors.js';

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
        const birthInformation = {
          birthCountry: null,
          birthCity: 'GOTHAM CITY',
          birthPostalCode: '12345',
          birthINSEECode: '12345',
        };
        const cpfBirthInformationValidationResult = new CpfBirthInformationValidation({ ...birthInformation });
        cpfBirthInformationValidationResult.failure({
          certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_COUNTRY_REQUIRED,
        });
        const result = await getBirthInformation({
          ...birthInformation,
          certificationCpfCityRepository,
          certificationCpfCountryRepository,
        });

        // then
        expect(result).to.deep.equal(cpfBirthInformationValidationResult);
      });
    });

    context('when country does not exist', function () {
      it('should return a validation failure', async function () {
        // given
        const birthInformation = {
          birthCountry: 'ABCD',
          birthCity: 'GOTHAM CITY',
          birthPostalCode: null,
          birthINSEECode: '12345',
        };
        const cpfBirthInformationValidation = new CpfBirthInformationValidation({ ...birthInformation });
        cpfBirthInformationValidation.failure({
          certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_COUNTRY_NOT_FOUND,
          data: { birthCountry: birthInformation.birthCountry },
        });

        certificationCpfCountryRepository.getByMatcher.resolves(null);

        // when
        const result = await getBirthInformation({
          ...birthInformation,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
        });

        // then
        expect(result).to.deep.equal(cpfBirthInformationValidation);
      });
    });

    context('when country exists', function () {
      context('when country is not FRANCE', function () {
        it('should return a validation failure when city name is not defined', async function () {
          // given
          const birthInformation = {
            birthCountry: 'PORTUGAL',
            birthCity: null,
            birthPostalCode: null,
            birthINSEECode: '99',
          };
          const cpfBirthInformationValidation = new CpfBirthInformationValidation({ ...birthInformation });
          cpfBirthInformationValidation.failure({
            certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_FOREIGN_BIRTH_CITY_REQUIRED,
          });

          const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry({
            code: '1234',
            name: 'PORTUGAL',
          });

          certificationCpfCountryRepository.getByMatcher
            .withArgs({ matcher: 'AGLOPRTU' })
            .resolves(certificationCPFCountry);

          // when
          const result = await getBirthInformation({
            ...birthInformation,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
          });

          // then
          expect(result).to.deep.equal(cpfBirthInformationValidation);
        });

        it('should return a validation failure when postal code is defined', async function () {
          // given
          const birthInformation = {
            birthCountry: 'PORTUGAL',
            birthCity: 'Porto',
            birthPostalCode: '1234',
            birthINSEECode: '99',
          };
          const cpfBirthInformationValidation = new CpfBirthInformationValidation({ ...birthInformation });
          cpfBirthInformationValidation.failure({
            certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_FOREIGN_POSTAL_CODE_MUST_BE_EMPTY,
          });

          const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry({
            code: '1234',
            name: 'PORTUGAL',
          });

          certificationCpfCountryRepository.getByMatcher
            .withArgs({ matcher: 'AGLOPRTU' })
            .resolves(certificationCPFCountry);

          // when
          const result = await getBirthInformation({
            ...birthInformation,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
          });

          // then
          expect(result).to.deep.equal(cpfBirthInformationValidation);
        });

        it('should return a validation failure when INSEE code is not defined', async function () {
          // given
          const birthInformation = {
            birthCountry: 'PORTUGAL',
            birthCity: 'Porto',
            birthPostalCode: null,
            birthINSEECode: null,
          };
          const cpfBirthInformationValidation = new CpfBirthInformationValidation({ ...birthInformation });
          cpfBirthInformationValidation.failure({
            certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_FOREIGN_INSEE_CODE_NOT_VALID,
          });

          const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry({
            code: '1234',
            name: 'PORTUGAL',
          });

          certificationCpfCountryRepository.getByMatcher
            .withArgs({ matcher: 'AGLOPRTU' })
            .resolves(certificationCPFCountry);

          // when
          const result = await getBirthInformation({
            ...birthInformation,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
          });

          // then
          expect(result).to.deep.equal(cpfBirthInformationValidation);
        });

        it('should return a validation failure when INSEE code is not 99', async function () {
          // given
          const birthInformation = {
            birthCountry: 'PORTUGAL',
            birthCity: 'Porto',
            birthPostalCode: null,
            birthINSEECode: '1234',
          };
          const cpfBirthInformationValidation = new CpfBirthInformationValidation({ ...birthInformation });
          cpfBirthInformationValidation.failure({
            certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_FOREIGN_INSEE_CODE_NOT_VALID,
          });

          const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry({
            code: '1234',
            name: 'PORTUGAL',
          });

          certificationCpfCountryRepository.getByMatcher
            .withArgs({ matcher: 'AGLOPRTU' })
            .resolves(certificationCPFCountry);

          // when
          const result = await getBirthInformation({
            ...birthInformation,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
          });

          // then
          expect(result).to.deep.equal(cpfBirthInformationValidation);
        });

        it('should return birth information when city name is defined', async function () {
          // given
          const birthInformation = {
            birthCountry: 'PORTUGAL',
            birthCity: 'Porto',
            birthPostalCode: null,
            birthINSEECode: '99',
          };

          const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry({
            code: '1234',
            name: 'PORTUGAL',
          });

          certificationCpfCountryRepository.getByMatcher
            .withArgs({ matcher: 'AGLOPRTU' })
            .resolves(certificationCPFCountry);

          // when
          const result = await getBirthInformation({
            ...birthInformation,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
          });

          // then
          expect(result).to.deep.equal(
            new CpfBirthInformationValidation({
              ...birthInformation,
              birthINSEECode: '1234',
            }),
          );
        });
      });

      context('when country is FRANCE', function () {
        context('when postal code and INSEE code are not defined', function () {
          context('when birthcity is defined', function () {
            it('should return a validation failure', async function () {
              // given
              const birthInformation = {
                birthCountry: 'FRANCE',
                birthCity: 'Tours',
                birthPostalCode: null,
                birthINSEECode: null,
              };
              const cpfBirthInformationValidation = new CpfBirthInformationValidation({ ...birthInformation });
              cpfBirthInformationValidation.failure({
                certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_POSTAL_CODE_REQUIRED,
              });

              const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
              certificationCpfCountryRepository.getByMatcher
                .withArgs({ matcher: 'ACEFNR' })
                .resolves(certificationCPFCountry);

              // when
              const result = await getBirthInformation({
                ...birthInformation,
                certificationCpfCountryRepository,
                certificationCpfCityRepository,
              });

              // then
              expect(result).to.deep.equal(cpfBirthInformationValidation);
            });
          });
          context('when birthcity is not defined', function () {
            it('should return a validation failure', async function () {
              // given
              const birthInformation = {
                birthCountry: 'FRANCE',
                birthCity: null,
                birthPostalCode: null,
                birthINSEECode: null,
              };
              const cpfBirthInformationValidation = new CpfBirthInformationValidation({ ...birthInformation });
              cpfBirthInformationValidation.failure({
                certificationCandidateError:
                  CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_INSEE_CODE_OR_BIRTH_POSTAL_CODE_AND_BIRTH_CITY_REQUIRED,
              });

              const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
              certificationCpfCountryRepository.getByMatcher
                .withArgs({ matcher: 'ACEFNR' })
                .resolves(certificationCPFCountry);

              // when
              const result = await getBirthInformation({
                ...birthInformation,
                certificationCpfCountryRepository,
                certificationCpfCityRepository,
              });

              // then
              expect(result).to.deep.equal(cpfBirthInformationValidation);
            });
          });
        });

        context('when both postal code and INSEE code are defined', function () {
          context('when birthcity is defined', function () {
            it('should return a validation failure', async function () {
              // given
              const birthInformation = {
                birthCountry: 'FRANCE',
                birthCity: 'MARSEILLE',
                birthPostalCode: '1234',
                birthINSEECode: '1234',
              };
              const cpfBirthInformationValidation = new CpfBirthInformationValidation({ ...birthInformation });
              cpfBirthInformationValidation.failure({
                certificationCandidateError:
                  CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_INSEE_CODE_OR_BIRTH_POSTAL_CODE_AND_BIRTH_CITY_REQUIRED,
              });

              const marseilleCpf = domainBuilder.buildCertificationCpfCity({
                postalCode: '1234',
                INSEECode: '1234',
                name: 'MARSEILLE',
              });
              certificationCpfCityRepository.findByINSEECode.withArgs({ INSEECode: '1234' }).resolves([marseilleCpf]);
              certificationCpfCityRepository.findByPostalCode.withArgs({ postalCode: '1234' }).resolves([marseilleCpf]);

              const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
              certificationCpfCountryRepository.getByMatcher
                .withArgs({ matcher: 'ACEFNR' })
                .resolves(certificationCPFCountry);

              // when
              const result = await getBirthInformation({
                ...birthInformation,
                certificationCpfCountryRepository,
                certificationCpfCityRepository,
              });

              // then
              expect(result).to.deep.equal(cpfBirthInformationValidation);
            });
          });
          context('when birthcity is not defined', function () {
            it('should return a validation failure', async function () {
              // given
              const birthInformation = {
                birthCountry: 'FRANCE',
                birthCity: null,
                birthPostalCode: '1234',
                birthINSEECode: '1234',
              };
              const cpfBirthInformationValidation = new CpfBirthInformationValidation({ ...birthInformation });
              cpfBirthInformationValidation.failure({
                certificationCandidateError:
                  CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_INSEE_CODE_OR_BIRTH_POSTAL_CODE_AND_BIRTH_CITY_REQUIRED,
              });

              const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
              certificationCpfCountryRepository.getByMatcher
                .withArgs({ matcher: 'ACEFNR' })
                .resolves(certificationCPFCountry);

              // when
              const result = await getBirthInformation({
                ...birthInformation,
                certificationCpfCountryRepository,
                certificationCpfCityRepository,
              });

              // then
              expect(result).to.deep.equal(cpfBirthInformationValidation);
            });
          });
        });

        context('when INSEE code is provided', function () {
          it('should return birth information when INSEE code is valid', async function () {
            // given
            const birthInformation = {
              birthCountry: 'FRANCE',
              birthCity: null,
              birthPostalCode: null,
              birthINSEECode: '12345',
            };
            const cpfBirthInformationValidation = new CpfBirthInformationValidation({ ...birthInformation });
            cpfBirthInformationValidation.success({
              birthCountry: 'FRANCE',
              birthINSEECode: '12345',
              birthPostalCode: null,
              birthCity: 'GOTHAM CITY',
            });

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
            certificationCpfCountryRepository.getByMatcher
              .withArgs({ matcher: 'ACEFNR' })
              .resolves(certificationCPFCountry);

            const certificationCPFCity = domainBuilder.buildCertificationCpfCity({
              INSEECode: birthInformation.birthINSEECode,
              name: 'GOTHAM CITY',
            });
            certificationCpfCityRepository.findByINSEECode.resolves([certificationCPFCity]);

            certificationCpfCountryRepository.getByMatcher
              .withArgs({ matcher: 'ACEFNR' })
              .resolves(certificationCPFCountry);
            certificationCpfCityRepository.findByINSEECode.resolves([certificationCPFCity]);

            // when
            const result = await getBirthInformation({
              ...birthInformation,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(cpfBirthInformationValidation);
            expect(certificationCpfCityRepository.findByINSEECode).to.have.been.calledWithExactly({
              INSEECode: birthInformation.birthINSEECode,
            });
          });

          it('should return a validation failure when INSEE code is not valid', async function () {
            // given
            const birthInformation = {
              birthCountry: 'FRANCE',
              birthCity: null,
              birthPostalCode: null,
              birthINSEECode: '12345',
            };
            const cpfBirthInformationValidation = new CpfBirthInformationValidation({ ...birthInformation });
            cpfBirthInformationValidation.failure({
              certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_INSEE_CODE_NOT_VALID,
              data: { birthINSEECode: birthInformation.birthINSEECode },
            });

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();

            certificationCpfCountryRepository.getByMatcher
              .withArgs({ matcher: 'ACEFNR' })
              .resolves(certificationCPFCountry);

            certificationCpfCityRepository.findByINSEECode.resolves([]);

            // when
            const result = await getBirthInformation({
              ...birthInformation,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(cpfBirthInformationValidation);
          });

          it('should return a validation failure when birth city is provided along with INSEE code', async function () {
            // given
            const birthInformation = {
              birthCountry: 'FRANCE',
              birthCity: 'GOTHAM CITY',
              birthPostalCode: null,
              birthINSEECode: '12345',
            };
            const cpfBirthInformationValidation = new CpfBirthInformationValidation({ ...birthInformation });
            cpfBirthInformationValidation.failure({
              certificationCandidateError:
                CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_INSEE_CODE_OR_BIRTH_POSTAL_CODE_AND_BIRTH_CITY_REQUIRED,
            });

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
            certificationCpfCountryRepository.getByMatcher
              .withArgs({ matcher: 'ACEFNR' })
              .resolves(certificationCPFCountry);

            const gothamCpf = domainBuilder.buildCertificationCpfCity({
              INSEECode: '12345',
              name: 'GOTHAM CITY',
            });
            certificationCpfCityRepository.findByINSEECode.resolves([gothamCpf]);

            // when
            const result = await getBirthInformation({
              ...birthInformation,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(cpfBirthInformationValidation);
          });
        });

        context('when postal code is provided', function () {
          it('should return birth information when postal code is valid', async function () {
            // given
            const birthInformation = {
              birthCountry: 'FRANCE',
              birthCity: 'GOTHAM CITY',
              birthPostalCode: '12345',
              birthINSEECode: null,
            };
            const cpfBirthInformationValidation = new CpfBirthInformationValidation({ ...birthInformation });
            cpfBirthInformationValidation.success({
              birthCountry: 'FRANCE',
              birthINSEECode: null,
              birthPostalCode: '12345',
              birthCity: 'GOTHAM CITY',
            });

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
            const certificationCPFCity = domainBuilder.buildCertificationCpfCity({
              birthPostalCode: birthInformation.birthPostalCode,
              name: 'GOTHAM CITY',
            });

            certificationCpfCountryRepository.getByMatcher
              .withArgs({ matcher: 'ACEFNR' })
              .resolves(certificationCPFCountry);
            certificationCpfCityRepository.findByPostalCode.resolves([certificationCPFCity]);

            // when
            const result = await getBirthInformation({
              ...birthInformation,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(cpfBirthInformationValidation);
            expect(certificationCpfCityRepository.findByPostalCode).to.have.been.calledWithExactly({
              postalCode: birthInformation.birthPostalCode,
            });
          });

          context('when there is multiple cities for the same postal code', function () {
            it('should return birth information with the normalized provided city name', async function () {
              // given
              const birthInformation = {
                birthCountry: 'FRANCE',
                birthCity: 'Losse-en-Gelaisse',
                birthPostalCode: '12345',
                birthINSEECode: null,
              };
              const cpfBirthInformationValidation = new CpfBirthInformationValidation({ ...birthInformation });
              cpfBirthInformationValidation.success({
                birthCountry: 'FRANCE',
                birthINSEECode: null,
                birthPostalCode: '12345',
                birthCity: 'LOSSE EN GELAISSE',
              });

              const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
              certificationCpfCountryRepository.getByMatcher
                .withArgs({ matcher: 'ACEFNR' })
                .resolves(certificationCPFCountry);
              certificationCpfCityRepository.findByPostalCode.resolves([
                domainBuilder.buildCertificationCpfCity({
                  birthPostalCode: birthInformation.birthPostalCode,
                  name: 'NOUILLORC',
                  isActualName: true,
                }),
                domainBuilder.buildCertificationCpfCity({
                  birthPostalCode: birthInformation.birthPostalCode,
                  name: 'LOSSE EN GELAISSE',
                  isActualName: true,
                }),
              ]);

              // when
              const result = await getBirthInformation({
                ...birthInformation,
                certificationCpfCountryRepository,
                certificationCpfCityRepository,
              });

              // then
              expect(result).to.deep.equal(cpfBirthInformationValidation);
              expect(certificationCpfCityRepository.findByPostalCode).to.have.been.calledWithExactly({
                postalCode: birthInformation.birthPostalCode,
              });
            });
          });

          it('should return a validation failure when postal code is not valid', async function () {
            // given
            const birthInformation = {
              birthCountry: 'FRANCE',
              birthCity: 'GOTHAM CITY',
              birthPostalCode: '12345',
              birthINSEECode: null,
            };
            const cpfBirthInformationValidation = new CpfBirthInformationValidation({ ...birthInformation });
            cpfBirthInformationValidation.failure({
              certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_POSTAL_CODE_NOT_FOUND,
              data: { birthPostalCode: birthInformation.birthPostalCode },
            });

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();

            certificationCpfCountryRepository.getByMatcher
              .withArgs({ matcher: 'ACEFNR' })
              .resolves(certificationCPFCountry);
            certificationCpfCityRepository.findByPostalCode.resolves([]);

            // when
            const result = await getBirthInformation({
              ...birthInformation,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(cpfBirthInformationValidation);
          });

          it('should return a validation failure when birth city is not defined', async function () {
            // given
            const birthInformation = {
              birthCountry: 'FRANCE',
              birthCity: null,
              birthPostalCode: '12345',
              birthINSEECode: null,
            };
            const cpfBirthInformationValidation = new CpfBirthInformationValidation({ ...birthInformation });
            cpfBirthInformationValidation.failure({
              certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_CITY_REQUIRED,
            });

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
            certificationCpfCountryRepository.getByMatcher
              .withArgs({ matcher: 'ACEFNR' })
              .resolves(certificationCPFCountry);

            // when
            const result = await getBirthInformation({
              ...birthInformation,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(cpfBirthInformationValidation);
          });

          it('should return a validation failure when postal code does not match city name', async function () {
            // given
            const birthInformation = {
              birthCountry: 'FRANCE',
              birthCity: 'METROPOLIS',
              birthPostalCode: '12345',
              birthINSEECode: null,
            };
            const cpfBirthInformationValidation = new CpfBirthInformationValidation({ ...birthInformation });
            cpfBirthInformationValidation.failure({
              certificationCandidateError: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_POSTAL_CODE_CITY_NOT_VALID,
              data: { birthPostalCode: birthInformation.birthPostalCode, birthCity: birthInformation.birthCity },
            });

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();

            const certificationCPFCity = domainBuilder.buildCertificationCpfCity({
              birthPostalCode: birthInformation.birthPostalCode,
              name: 'GOTHAM CITY',
            });

            certificationCpfCountryRepository.getByMatcher
              .withArgs({ matcher: 'ACEFNR' })
              .resolves(certificationCPFCountry);
            certificationCpfCityRepository.findByPostalCode.resolves([certificationCPFCity]);

            // when
            const result = await getBirthInformation({
              ...birthInformation,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(cpfBirthInformationValidation);
          });
        });
      });
    });
  });
});
