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
          countryName: null,
          cityName: 'GOTHAM CITY',
          postalCode: '12345',
          INSEECode: '12345',
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
        const countryName = 'ABCD';
        const cityName = 'GOTHAM CITY';
        const postalCode = null;
        const INSEECode = '12345';

        certificationCpfCountryRepository.getByMatcher.resolves(null);

        // when
        const result = await getBirthInformation({
          countryName,
          cityName,
          postalCode,
          INSEECode,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
        });

        // then
        expect(result).to.deep.equal(CpfBirthInformationValidation.failure(`Le pays ${countryName} n'a pas été trouvé.`));
      });
    });

    context('when country exists', () => {

      context('when country is not FRANCE', () => {

        it('should return a validation failure when city name is not defined', async() => {
          // given
          const countryName = 'PORTUGAL';
          const cityName = null;
          const postalCode = null;
          const INSEECode = '99';

          const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry({ code: '1234', name: 'PORTUGAL' });

          certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'AGLOPRTU' }).resolves(certificationCPFCountry);

          // when
          const result = await getBirthInformation({
            countryName,
            cityName,
            postalCode,
            INSEECode,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
          });

          // then
          expect(result).to.deep.equal(CpfBirthInformationValidation.failure('Le champ ville est obligatoire.'));
        });

        it('should return a validation failure when Insee code is not defined', async() => {
          // given
          const countryName = 'PORTUGAL';
          const cityName = 'Porto';
          const postalCode = null;
          const INSEECode = null;

          const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry({ code: '1234', name: 'PORTUGAL' });

          certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'AGLOPRTU' }).resolves(certificationCPFCountry);

          // when
          const result = await getBirthInformation({
            countryName,
            cityName,
            postalCode,
            INSEECode,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
          });

          // then
          expect(result).to.deep.equal(CpfBirthInformationValidation.failure('Le champ code postal ou code INSEE doit être renseigné.'));
        });

        it('should return birth information when city name is defined', async() => {
          // given
          const countryName = 'PORTUGAL';
          const cityName = 'Porto';
          const postalCode = null;
          const INSEECode = '99';

          const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry({ code: '1234', name: 'PORTUGAL' });

          certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'AGLOPRTU' }).resolves(certificationCPFCountry);

          // when
          const result = await getBirthInformation({
            countryName,
            cityName,
            postalCode,
            INSEECode,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
          });

          // then
          expect(result).to.deep.equal(CpfBirthInformationValidation.success({
            countryName: 'PORTUGAL',
            INSEECode: '1234',
            postalCode: null,
            cityName: 'Porto',
          }));
        });
      });

      context('when country is FRANCE', () => {

        context('when postal code and INSEE code are not defined', async () => {

          it('should return a validation failure', async () => {
            // given
            const countryName = 'FRANCE';
            const cityName = null;
            const postalCode = null;
            const INSEECode = null;

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
            certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'ACEFNR' }).resolves(certificationCPFCountry);

            // when
            const result = await getBirthInformation({
              countryName,
              cityName,
              postalCode,
              INSEECode,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(CpfBirthInformationValidation.failure('Le champ code postal ou code INSEE doit être renseigné.'));
          });
        });

        context('when INSEE code is provided', () => {

          it('should return birth information when INSEE code is valid', async () => {
            // given
            const countryName = 'FRANCE';
            const cityName = 'GOTHAM CITY';
            const postalCode = null;
            const INSEECode = '12345';

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
            const certificationCPFCity = domainBuilder.buildCertificationCpfCity({
              INSEECode,
              name: 'GOTHAM CITY',
            });

            certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'ACEFNR' }).resolves(certificationCPFCountry);
            certificationCpfCityRepository.findByINSEECode.resolves([certificationCPFCity]);

            // when
            const result = await getBirthInformation({
              countryName,
              cityName,
              postalCode,
              INSEECode,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(CpfBirthInformationValidation.success({
              countryName: 'FRANCE',
              INSEECode: '12345',
              postalCode: null,
              cityName: 'GOTHAM CITY',
            }));
            expect(certificationCpfCityRepository.findByINSEECode).to.have.been.calledWith({ INSEECode });
          });

          it('should return a validation failure when INSEE code is not valid', async () => {
            // given
            const countryName = 'FRANCE';
            const cityName = 'GOTHAM CITY';
            const postalCode = null;
            const INSEECode = '12345';

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();

            certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'ACEFNR' }).resolves(certificationCPFCountry);
            certificationCpfCityRepository.findByINSEECode.resolves([]);

            // when
            const result = await getBirthInformation({
              countryName,
              cityName,
              postalCode,
              INSEECode,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(CpfBirthInformationValidation.failure(`Le code INSEE ${INSEECode} n'est pas valide.`));
          });
        });

        context('when postal code is provided', () => {

          it('should return birth information when postal code is valid', async () => {
            // given
            const countryName = 'FRANCE';
            const cityName = 'GOTHAM CITY';
            const postalCode = '12345';
            const INSEECode = null;

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();
            const certificationCPFCity = domainBuilder.buildCertificationCpfCity({
              postalCode,
              name: 'GOTHAM CITY',
            });

            certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'ACEFNR' }).resolves(certificationCPFCountry);
            certificationCpfCityRepository.findByPostalCode.resolves([certificationCPFCity]);

            // when
            const result = await getBirthInformation({
              countryName,
              cityName,
              postalCode,
              INSEECode,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(CpfBirthInformationValidation.success({
              countryName: 'FRANCE',
              INSEECode: null,
              postalCode: '12345',
              cityName: 'GOTHAM CITY',
            }));
            expect(certificationCpfCityRepository.findByPostalCode).to.have.been.calledWith({ postalCode });
          });

          it('should return a validation failure when postal code is not valid', async () => {
            // given
            const countryName = 'FRANCE';
            const cityName = 'GOTHAM CITY';
            const postalCode = '12345';
            const INSEECode = null;

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();

            certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'ACEFNR' }).resolves(certificationCPFCountry);
            certificationCpfCityRepository.findByPostalCode.resolves([]);

            // when
            const result = await getBirthInformation({
              countryName,
              cityName,
              postalCode,
              INSEECode,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(CpfBirthInformationValidation.failure(`Le code postal ${postalCode} n'est pas valide.`));
          });

          it('should return a validation failure when postal code does not match city name', async () => {
            // given
            const countryName = 'FRANCE';
            const cityName = 'METROPOLIS';
            const postalCode = '12345';
            const INSEECode = null;

            const certificationCPFCountry = domainBuilder.buildCertificationCpfCountry.FRANCE();

            const certificationCPFCity = domainBuilder.buildCertificationCpfCity({
              postalCode,
              name: 'GOTHAM CITY',
            });

            certificationCpfCountryRepository.getByMatcher.withArgs({ matcher: 'ACEFNR' }).resolves(certificationCPFCountry);
            certificationCpfCityRepository.findByPostalCode.resolves([certificationCPFCity]);

            // when
            const result = await getBirthInformation({
              countryName,
              cityName,
              postalCode,
              INSEECode,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(result).to.deep.equal(CpfBirthInformationValidation.failure(`Le code postal ${postalCode} ne correspond pas à la ville ${cityName}`));
          });
        });
      });
    });
  });
});
