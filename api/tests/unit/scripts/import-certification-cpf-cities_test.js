const { expect, sinon } = require('../../test-helper');
const {
  buildCities,
  getCitiesWithDistricts,
} = require('../../../scripts/certification/import-certification-cpf-cities');
const { noop } = require('lodash/noop');

describe('Unit | Scripts | import-certification-cpf-cities.js', function () {
  beforeEach(function () {
    sinon.stub(console, 'error').callsFake(noop);
  });

  describe('#buildCities', function () {
    describe('#when there are n alternate names', function () {
      it('should return n+1 lines for the city', function () {
        const csvData = [
          {
            code_commune_insee: '30288',
            nom_de_la_commune: 'NAZAIRE',
            code_postal: '30200',
            ligne_5: null,
          },
          {
            code_commune_insee: '44184',
            nom_de_la_commune: 'NAZAIRE',
            code_postal: '44600',
            ligne_5: 'ALTERNATE NAZAIRE',
          },
          {
            code_commune_insee: '66186',
            nom_de_la_commune: 'NAZAIRE',
            code_postal: '66570',
            ligne_5: null,
          },
          {
            code_commune_insee: '44184',
            nom_de_la_commune: 'NAZAIRE',
            code_postal: '44600',
            ligne_5: null,
          },
        ];

        // when
        const cities = buildCities({ csvData });

        // then
        expect(cities).to.deep.equal([
          {
            INSEECode: '30288',
            isActualName: true,
            name: 'NAZAIRE',
            postalCode: '30200',
          },
          {
            INSEECode: '44184',
            isActualName: true,
            name: 'NAZAIRE',
            postalCode: '44600',
          },
          {
            INSEECode: '44184',
            isActualName: false,
            name: 'ALTERNATE NAZAIRE',
            postalCode: '44600',
          },
          {
            INSEECode: '66186',
            isActualName: true,
            name: 'NAZAIRE',
            postalCode: '66570',
          },
        ]);
      });

      context('#when there is a word to replace in the city alternate name', function () {
        // eslint-disable-next-line mocha/no-setup-in-describe
        [
          {
            cityName: 'DUNKERQUE',
            cityAlternateName: 'ST POL SUR MER',
            expectedCityAlternateName: 'SAINT POL SUR MER',
          },
          {
            cityName: 'NEUSSARGUES EN PINATELLE',
            cityAlternateName: 'STE ANASTASIE',
            expectedCityAlternateName: 'SAINTE ANASTASIE',
          },
        ].forEach(({ cityName, cityAlternateName, expectedCityAlternateName }) => {
          it('should return 3 lines,  for the city name and two both long and short alternate city names', function () {
            // given
            const csvData = [
              {
                code_commune_insee: '50453',
                nom_de_la_commune: cityName,
                code_postal: '50800',
                ligne_5: cityAlternateName,
              },
            ];

            // when
            const cities = buildCities({ csvData });

            // then
            expect(cities).to.deep.equal([
              {
                INSEECode: '50453',
                isActualName: true,
                name: cityName,
                postalCode: '50800',
              },
              {
                INSEECode: '50453',
                isActualName: false,
                name: cityAlternateName,
                postalCode: '50800',
              },
              {
                INSEECode: '50453',
                isActualName: false,
                name: expectedCityAlternateName,
                postalCode: '50800',
              },
            ]);
          });
        });
      });
    });

    describe('#when there are no alternate names', function () {
      it('should return 1 line', function () {
        // given
        const csvData = [
          {
            code_commune_insee: '00001',
            nom_de_la_commune: 'GOTHAM CITY',
            code_postal: '09966',
          },
        ];

        // when
        const cities = buildCities({ csvData });

        // then
        expect(cities).to.deep.equal([
          {
            INSEECode: '00001',
            name: 'GOTHAM CITY',
            postalCode: '09966',
            isActualName: true,
          },
        ]);
      });

      context('#when there is a word to replace in the city name', function () {
        // eslint-disable-next-line mocha/no-setup-in-describe
        [
          { cityName: 'STE CECILE', expectedCityName: 'SAINTE CECILE' },
          { cityName: 'ST NAZAIRE', expectedCityName: 'SAINT NAZAIRE' },
          { cityName: 'NAZAIRE STE CECILE', expectedCityName: 'NAZAIRE SAINTE CECILE' },
          { cityName: 'CECILE ST NAZAIRE', expectedCityName: 'CECILE SAINT NAZAIRE' },
        ].forEach(({ cityName, expectedCityName }) => {
          it('should return 2 lines with both long and short city names', function () {
            // given
            const csvData = [
              {
                code_commune_insee: '50453',
                nom_de_la_commune: cityName,
                code_postal: '50800',
                ligne_5: null,
              },
            ];

            // when
            const cities = buildCities({ csvData });

            // then
            expect(cities).to.deep.equal([
              {
                INSEECode: '50453',
                isActualName: true,
                name: cityName,
                postalCode: '50800',
              },
              {
                INSEECode: '50453',
                isActualName: false,
                name: expectedCityName,
                postalCode: '50800',
              },
            ]);
          });
        });
      });
    });
  });

  describe('#getCitiesWithDistricts', function () {
    it('should return the list of cities with districts', function () {
      // when
      const cities = getCitiesWithDistricts();

      // then
      expect(cities.filter(({ name }) => name === 'PARIS').length).to.equal(21);
      expect(cities.filter(({ name }) => name === 'LYON').length).to.equal(10);
      expect(cities.filter(({ name }) => name === 'MARSEILLE').length).to.equal(17);
      expect(cities).to.deep.equal([
        {
          name: 'PARIS',
          postalCode: 75000,
          INSEECode: 75056,
          isActualName: true,
        },
        {
          name: 'PARIS',
          postalCode: 75001,
          INSEECode: 75101,
          isActualName: false,
        },
        {
          name: 'PARIS',
          postalCode: 75002,
          INSEECode: 75102,
          isActualName: false,
        },
        {
          name: 'PARIS',
          postalCode: 75003,
          INSEECode: 75103,
          isActualName: false,
        },
        {
          name: 'PARIS',
          postalCode: 75004,
          INSEECode: 75104,
          isActualName: false,
        },
        {
          name: 'PARIS',
          postalCode: 75005,
          INSEECode: 75106,
          isActualName: false,
        },
        {
          name: 'PARIS',
          postalCode: 75006,
          INSEECode: 75106,
          isActualName: false,
        },
        {
          name: 'PARIS',
          postalCode: 75007,
          INSEECode: 75107,
          isActualName: false,
        },
        {
          name: 'PARIS',
          postalCode: 75008,
          INSEECode: 75108,
          isActualName: false,
        },
        {
          name: 'PARIS',
          postalCode: 75009,
          INSEECode: 75109,
          isActualName: false,
        },
        {
          name: 'PARIS',
          postalCode: 75010,
          INSEECode: 75110,
          isActualName: false,
        },
        {
          name: 'PARIS',
          postalCode: 750011,
          INSEECode: 75111,
          isActualName: false,
        },
        {
          name: 'PARIS',
          postalCode: 75012,
          INSEECode: 75112,
          isActualName: false,
        },
        {
          name: 'PARIS',
          postalCode: 75013,
          INSEECode: 75113,
          isActualName: false,
        },
        {
          name: 'PARIS',
          postalCode: 75014,
          INSEECode: 75114,
          isActualName: false,
        },
        {
          name: 'PARIS',
          postalCode: 75015,
          INSEECode: 75115,
          isActualName: false,
        },
        {
          name: 'PARIS',
          postalCode: 75016,
          INSEECode: 75116,
          isActualName: false,
        },
        {
          name: 'PARIS',
          postalCode: 75017,
          INSEECode: 75117,
          isActualName: false,
        },
        {
          name: 'PARIS',
          postalCode: 75018,
          INSEECode: 75118,
          isActualName: false,
        },
        {
          name: 'PARIS',
          postalCode: 75019,
          INSEECode: 75119,
          isActualName: false,
        },
        {
          name: 'PARIS',
          postalCode: 75020,
          INSEECode: 75120,
          isActualName: false,
        },
        {
          name: 'LYON',
          postalCode: 69000,
          INSEECode: 69123,
          isActualName: true,
        },
        {
          name: 'LYON',
          postalCode: 69001,
          INSEECode: 69381,
          isActualName: false,
        },
        {
          name: 'LYON',
          postalCode: 69002,
          INSEECode: 69382,
          isActualName: false,
        },
        {
          name: 'LYON',
          postalCode: 69003,
          INSEECode: 69383,
          isActualName: false,
        },
        {
          name: 'LYON',
          postalCode: 69004,
          INSEECode: 69384,
          isActualName: false,
        },
        {
          name: 'LYON',
          postalCode: 69005,
          INSEECode: 69385,
          isActualName: false,
        },
        {
          name: 'LYON',
          postalCode: 69006,
          INSEECode: 69386,
          isActualName: false,
        },
        {
          name: 'LYON',
          postalCode: 69007,
          INSEECode: 69387,
          isActualName: false,
        },
        {
          name: 'LYON',
          postalCode: 69008,
          INSEECode: 69388,
          isActualName: false,
        },
        {
          name: 'LYON',
          postalCode: 69009,
          INSEECode: 69389,
          isActualName: false,
        },
        {
          name: 'MARSEILLE',
          postalCode: 13000,
          INSEECode: 13055,
          isActualName: true,
        },
        {
          name: 'MARSEILLE',
          postalCode: 13001,
          INSEECode: 13201,
          isActualName: false,
        },
        {
          name: 'MARSEILLE',
          postalCode: 13002,
          INSEECode: 13202,
          isActualName: false,
        },
        {
          name: 'MARSEILLE',
          postalCode: 13003,
          INSEECode: 13203,
          isActualName: false,
        },
        {
          name: 'MARSEILLE',
          postalCode: 13004,
          INSEECode: 13204,
          isActualName: false,
        },
        {
          name: 'MARSEILLE',
          postalCode: 13005,
          INSEECode: 13205,
          isActualName: false,
        },
        {
          name: 'MARSEILLE',
          postalCode: 13006,
          INSEECode: 13206,
          isActualName: false,
        },
        {
          name: 'MARSEILLE',
          postalCode: 13007,
          INSEECode: 13207,
          isActualName: false,
        },
        {
          name: 'MARSEILLE',
          postalCode: 13008,
          INSEECode: 13208,
          isActualName: false,
        },
        {
          name: 'MARSEILLE',
          postalCode: 13009,
          INSEECode: 13209,
          isActualName: false,
        },
        {
          name: 'MARSEILLE',
          postalCode: 13010,
          INSEECode: 13210,
          isActualName: false,
        },
        {
          name: 'MARSEILLE',
          postalCode: 13011,
          INSEECode: 13211,
          isActualName: false,
        },
        {
          name: 'MARSEILLE',
          postalCode: 13012,
          INSEECode: 13212,
          isActualName: false,
        },
        {
          name: 'MARSEILLE',
          postalCode: 13013,
          INSEECode: 13213,
          isActualName: false,
        },
        {
          name: 'MARSEILLE',
          postalCode: 13014,
          INSEECode: 13214,
          isActualName: false,
        },
        {
          name: 'MARSEILLE',
          postalCode: 13015,
          INSEECode: 13215,
          isActualName: false,
        },
        {
          name: 'MARSEILLE',
          postalCode: 13016,
          INSEECode: 13216,
          isActualName: false,
        },
      ]);
    });
  });
});
