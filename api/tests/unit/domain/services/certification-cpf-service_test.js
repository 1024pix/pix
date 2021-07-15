const { expect, sinon, domainBuilder } = require('../../../test-helper');
const { CpfBirthInformationValidation, getBirthInformation } = require('../../../../lib/domain/services/certification-cpf-service');

describe('Unit | Service | Certification CPF service', () => {

  let certificationCpfCountryRepository;
  let certificationCpfCityRepository;

  beforeEach(() => {
    certificationCpfCountryRepository = {
      getByMatcher: sinon.stub(),
    };
    certificationCpfCityRepository = {
      findByINSEECode: sinon.stub(),
      findByPostalCode: sinon.stub(),
    };
  });

  describe('#getBirthInformation', () => {

    context('when country name is not defined', () => {

      it('should return a validation failure', async () => {
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
        expect(result).to.deep.equal(CpfBirthInformationValidation.failure('Le champ pays est obligatoire.'));
      });
    });

    context('when country does not exist', () => {

      it('should return a validation failure', async () => {
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
        expect(result).to.deep.equal(CpfBirthInformationValidation.failure(`Le pays "${birthCountry}" n'a pas été trouvé.`));
      });
    });

    context('when country exists', () => {

      context('when country is not FRANCE', () => {

        it('should return a validation failure when city name is not defined', async() => {
          // given
          const birthCountry = 'PORTUGAL';
          const birthCity = null;
          const birthPostalCode = null;
          const birthINSEECode = '99';

          const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry({ code: '1234', name: 'PORTUGAL' });

          certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'AGLOPRTU' }).resolves(certificationCPFCountry);

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
          expect(result).to.deep.equal(CpfBirthInformationValidation.failure('Le champ ville est obligatoire.'));
        });

        it('should return a validation failure when postal code is defined', async () => {
          // given
          const birthCountry = 'PORTUGAL';
          const birthCity = 'Porto';
          const birthPostalCode = '1234';
          const birthINSEECode = null;

          const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry({
            code: '1234',
            name: 'PORTUGAL',
          });

          certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'AGLOPRTU' }).resolves(certificationCPFCountry);

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
          expect(result).to.deep.equal(CpfBirthInformationValidation.failure('Le champ code postal ne doit pas être renseigné pour un pays étranger.'));
        });

        it('should return a validation failure when INSEE code is not defined', async () => {
          // given
          const birthCountry = 'PORTUGAL';
          const birthCity = 'Porto';
          const birthPostalCode = null;
          const birthINSEECode = null;

          const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry({
            code: '1234',
            name: 'PORTUGAL',
          });

          certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'AGLOPRTU' }).resolves(certificationCPFCountry);

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
          expect(result).to.deep.equal(CpfBirthInformationValidation.failure('La valeur du code INSEE doit être "99" pour un pays étranger.'));
        });

        it('should return a validation failure when INSEE code is not 99', async () => {
          // given
          const birthCountry = 'PORTUGAL';
          const birthCity = 'Porto';
          const birthPostalCode = null;
          const birthINSEECode = '1234';

          const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry({
            code: '1234',
            name: 'PORTUGAL',
          });

          certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'AGLOPRTU' }).resolves(certificationCPFCountry);

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
          expect(result).to.deep.equal(CpfBirthInformationValidation.failure('La valeur du code INSEE doit être "99" pour un pays étranger.'));
        });

        it('should return birth information when city name is defined', async () => {
          // given
          const birthCountry = 'PORTUGAL';
          const birthCity = 'Porto';
          const birthPostalCode = null;
          const birthINSEECode = '99';

          const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry({
            code: '1234',
            name: 'PORTUGAL',
          });

          certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'AGLOPRTU' }).resolves(certificationCPFCountry);

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
          expect(result).to.deep.equal(CpfBirthInformationValidation.success({
            birthCountry: 'PORTUGAL',
            birthINSEECode: '1234',
            birthPostalCode: null,
            birthCity: 'Porto',
          }));
        });
      });

      context('when country is FRANCE', () => {

        context('when postal code and INSEE code are not defined', async () => {

          it('should return a validation failure', async () => {
            // given
            const birthCountry = 'FRANCE';
            const birthCity = null;
            const birthPostalCode = null;
            const birthINSEECode = null;

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
            certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'ACEFNR' }).resolves(certificationCPFCountry);

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
            expect(result).to.deep.equal(CpfBirthInformationValidation.failure('Le champ code postal ou code INSEE doit être renseigné.'));
          });
        });

        context('when both postal code and INSEE code are defined', async () => {

          it('should return a validation failure', async () => {
            // given
            const birthCountry = 'FRANCE';
            const birthCity = null;
            const birthPostalCode = '1234';
            const birthINSEECode = '1234';

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
            certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'ACEFNR' }).resolves(certificationCPFCountry);

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
            expect(result).to.deep.equal(CpfBirthInformationValidation.failure('Seul l\'un des champs "Code postal" ou "Code Insee" doit être renseigné.'));
          });
        });

        context('when INSEE code is provided', () => {

          it('should return birth information when INSEE code is valid', async () => {
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

            certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'ACEFNR' }).resolves(certificationCPFCountry);
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
            expect(result).to.deep.equal(CpfBirthInformationValidation.success({
              birthCountry: 'FRANCE',
              birthINSEECode: '12345',
              birthPostalCode: null,
              birthCity: 'GOTHAM CITY',
            }));
            expect(certificationCpfCityRepository.findByINSEECode).to.have.been.calledWith({ INSEECode: birthINSEECode });
          });

          it('should return a validation failure when INSEE code is not valid', async () => {
            // given
            const birthCountry = 'FRANCE';
            const birthCity = null;
            const birthPostalCode = null;
            const birthINSEECode = '12345';

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();

            certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'ACEFNR' }).resolves(certificationCPFCountry);
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
            expect(result).to.deep.equal(CpfBirthInformationValidation.failure(`Le code INSEE "${birthINSEECode}" n'est pas valide.`));
          });

          it('should return a validation failure when birth city is provided along with INSEE code', async () => {
            // given
            const birthCountry = 'FRANCE';
            const birthCity = 'GOTHAM CITY';
            const birthPostalCode = null;
            const birthINSEECode = '12345';

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();

            certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'ACEFNR' }).resolves(certificationCPFCountry);
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
            expect(result).to.deep.equal(CpfBirthInformationValidation.failure('Le champ commune de naissance ne doit pas être renseigné lorsqu\'un code INSEE est renseigné.'));
          });
        });

        context('when postal code is provided', () => {

          it('should return birth information when postal code is valid', async () => {
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

            certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'ACEFNR' }).resolves(certificationCPFCountry);
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
            expect(result).to.deep.equal(CpfBirthInformationValidation.success({
              birthCountry: 'FRANCE',
              birthINSEECode: null,
              birthPostalCode: '12345',
              birthCity: 'GOTHAM CITY',
            }));
            expect(certificationCpfCityRepository.findByPostalCode).to.have.been.calledWith({ postalCode: birthPostalCode });
          });

          it('should return a validation failure when postal code is not valid', async () => {
            // given
            const birthCountry = 'FRANCE';
            const birthCity = 'GOTHAM CITY';
            const birthPostalCode = '12345';
            const birthINSEECode = null;

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();

            certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'ACEFNR' }).resolves(certificationCPFCountry);
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
            expect(result).to.deep.equal(CpfBirthInformationValidation.failure(`Le code postal "${birthPostalCode}" n'est pas valide.`));
          });

          it('should return a validation failure when birth city is not defined', async () => {
            // given
            const birthCountry = 'FRANCE';
            const birthCity = null;
            const birthPostalCode = '12345';
            const birthINSEECode = null;

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
            certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'ACEFNR' }).resolves(certificationCPFCountry);

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
            expect(result).to.deep.equal(CpfBirthInformationValidation.failure('Le champ ville est obligatoire.'));
          });

          it('should return a validation failure when postal code does not match city name', async () => {
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

            certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'ACEFNR' }).resolves(certificationCPFCountry);
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
            expect(result).to.deep.equal(CpfBirthInformationValidation.failure(`Le code postal "${birthPostalCode}" ne correspond pas à la ville "${birthCity}"`));
          });
        });
      });
    });
  });
});
