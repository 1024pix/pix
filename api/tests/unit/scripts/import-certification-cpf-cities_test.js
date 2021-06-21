const { expect, sinon } = require('../../test-helper');
const { buildCities } = require('../../../scripts/import-certification-cpf-cities');
const { noop } = require('lodash/noop');

describe('Unit | Scripts | import-certification-cpf-cities.js', () => {

  beforeEach(() => {
    sinon.stub(console, 'error').callsFake(noop);
  });

  describe('#buildCities', () => {
    describe('#when there are n alternate names', () => {

      it('should return n+1 lines for the city', () => {
      // given
        const csvData = [
          {
            Code_commune_INSEE: '00001',
            Nom_commune: 'GOTHAM CITY',
            Code_postal: '09966',
            Ligne_5: 'GOTHAM',
          },
          {
            Code_commune_INSEE: '00001',
            Nom_commune: 'GOTHAM CITY',
            Code_postal: '09966',
            Ligne_5: 'NEW GOTHAM',
          },
          {
            Code_commune_INSEE: '00002',
            Nom_commune: 'OTHER CITY',
            Code_postal: '09967',
          },
          {
            Code_commune_INSEE: '00001',
            Nom_commune: 'GOTHAM CITY',
            Code_postal: '09966',
            Ligne_5: 'OLD GOTHAM',
          },
        ];

        // when
        const cities = buildCities({ csvData });

        // then
        expect(cities).to.deep.equal([
          {
            'INSEECode': '00001',
            'isActualName': true,
            'name': 'GOTHAM CITY',
            'postalCode': '09966',
          },
          {
            'INSEECode': '00001',
            'isActualName': false,
            'name': 'GOTHAM',
            'postalCode': '09966',
          },
          {
            'INSEECode': '00001',
            'isActualName': false,
            'name': 'NEW GOTHAM',
            'postalCode': '09966',
          },
          {
            'INSEECode': '00002',
            'isActualName': true,
            'name': 'OTHER CITY',
            'postalCode': '09967',
          },
          {
            'INSEECode': '00001',
            'isActualName': false,
            'name': 'OLD GOTHAM',
            'postalCode': '09966',
          },
        ]);
      });

    });

    describe('#when there are no alternate names', () => {
      it('should return 1 line', () => {
      // given
        const csvData = [
          {
            Code_commune_INSEE: '00001',
            Nom_commune: 'GOTHAM CITY',
            Code_postal: '09966',
          },
        ];

        // when
        const cities = buildCities({ csvData });

        // then
        expect(cities).to.deep.equal([
          {
            'INSEECode': '00001',
            'name': 'GOTHAM CITY',
            'postalCode': '09966',
            'isActualName': true,
          },
        ]);
      });
    });
  });
});
