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

        const csvData = [
          {
            Code_commune_INSEE: '30288',
            Nom_commune: 'ST NAZAIRE',
            Code_postal: '30200',
            Ligne_5: null,
          },
          {
            Code_commune_INSEE: '44184',
            Nom_commune: 'ST NAZAIRE',
            Code_postal: '44600',
            Ligne_5: 'ST MARC SUR MER',
          },
          {
            Code_commune_INSEE: '66186',
            Nom_commune: 'ST NAZAIRE',
            Code_postal: '66570',
            Ligne_5: null,
          },
          {
            Code_commune_INSEE: '44184',
            Nom_commune: 'ST NAZAIRE',
            Code_postal: '44600',
            Ligne_5: null,
          },
        ];

        // when
        const cities = buildCities({ csvData });

        // then
        expect(cities).to.deep.equal([
          {
            'INSEECode': '30288',
            'isActualName': true,
            'name': 'ST NAZAIRE',
            'postalCode': '30200',
          },
          {
            'INSEECode': '44184',
            'isActualName': true,
            'name': 'ST NAZAIRE',
            'postalCode': '44600',
          },
          {
            'INSEECode': '44184',
            'isActualName': false,
            'name': 'ST MARC SUR MER',
            'postalCode': '44600',
          },
          {
            'INSEECode': '66186',
            'isActualName': true,
            'name': 'ST NAZAIRE',
            'postalCode': '66570',
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
