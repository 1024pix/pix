const { expect, sinon } = require('../../test-helper');
const { buildCities } = require('../../../scripts/import-certification-cpf-cities');
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
            nom_de_la_commune: 'ST NAZAIRE',
            code_postal: '30200',
            ligne_5: null,
          },
          {
            code_commune_insee: '44184',
            nom_de_la_commune: 'ST NAZAIRE',
            code_postal: '44600',
            ligne_5: 'ST MARC SUR MER',
          },
          {
            code_commune_insee: '66186',
            nom_de_la_commune: 'ST NAZAIRE',
            code_postal: '66570',
            ligne_5: null,
          },
          {
            code_commune_insee: '44184',
            nom_de_la_commune: 'ST NAZAIRE',
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
            name: 'ST NAZAIRE',
            postalCode: '30200',
          },
          {
            INSEECode: '44184',
            isActualName: true,
            name: 'ST NAZAIRE',
            postalCode: '44600',
          },
          {
            INSEECode: '44184',
            isActualName: false,
            name: 'ST MARC SUR MER',
            postalCode: '44600',
          },
          {
            INSEECode: '66186',
            isActualName: true,
            name: 'ST NAZAIRE',
            postalCode: '66570',
          },
        ]);
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
    });
  });
});
