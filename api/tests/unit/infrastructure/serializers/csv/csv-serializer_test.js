const { expect, catchErr, sinon } = require('../../../../test-helper');
const csvSerializer = require('../../../../../lib/infrastructure/serializers/csv/csv-serializer');
const logger = require('../../../../../lib/infrastructure/logger');

describe('Unit | Serializer | CSV | csv-serializer', function () {
  describe('#serializeLine', function () {
    it('should quote strings', async function () {
      // given
      const safeNumberAsString = '-123456';
      const csvExpected =
        '"String with \'single quotes\'";' + '"String with ""double quotes""";' + safeNumberAsString + '\n';

      // when
      const csv = csvSerializer.serializeLine([
        "String with 'single quotes'",
        'String with "double quotes"',
        safeNumberAsString,
      ]);

      // then
      expect(csv).to.equal(csvExpected);
    });

    it('should format numbers in French locale', async function () {
      // given
      const csvExpected = '123;' + '123,456\n';

      // when
      const csv = csvSerializer.serializeLine([123, 123.456]);

      // then
      expect(csv).to.equal(csvExpected);
    });

    it('should escape formula-likes to prevent CSV injections', async function () {
      // given
      const csvExpected = '"\'=formula-like";' + '"\'@formula-like";' + '"\'+formula-like";' + '"\'-formula-like"\n';

      // when
      const csv = csvSerializer.serializeLine(['=formula-like', '@formula-like', '+formula-like', '-formula-like']);

      // then
      expect(csv).to.equal(csvExpected);
    });

    context('should throw exceptions invalid format', function () {
      it('given object', async function () {
        // when
        sinon.stub(logger, 'error');
        await catchErr(csvSerializer.serializeLine)([{}]);
        // then
        expect(logger.error).to.have.been.calledWith(
          'Unknown value type in _csvSerializeValue: object: [object Object]'
        );
      });

      it('given null', async function () {
        // when
        sinon.stub(logger, 'error');
        await catchErr(csvSerializer.serializeLine)([null]);
        // then
        expect(logger.error).to.have.been.calledWith('Unknown value type in _csvSerializeValue: object: null');
      });

      it('given undefined', async function () {
        // when
        sinon.stub(logger, 'error');
        await catchErr(csvSerializer.serializeLine)([undefined]);
        // then
        expect(logger.error).to.have.been.calledWith('Unknown value type in _csvSerializeValue: undefined: undefined');
      });
    });
  });
  describe('#deserializeForSessionsImport', function () {
    it('should return an object with session information', function () {
      // given
      const parsedCsvData = [
        {
          '* Nom du site': 'Site 1',
          '* Nom de la salle': 'Salle 1',
          '* Date de début': '2022-03-12',
          '* Heure de début (heure locale)': '01:00',
          '* Surveillant(s)': 'Pierre',
          'Observations (optionnel)': '',
        },
      ];

      const expectedResult = [
        {
          address: 'Site 1',
          room: 'Salle 1',
          date: '2022-03-12',
          time: '01:00',
          examiner: 'Pierre',
          description: '',
        },
      ];

      // when
      const result = csvSerializer.deserializeForSessionsImport(parsedCsvData);

      // then
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
