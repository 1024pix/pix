const iconv = require('iconv-lite');
const { expect, catchErr } = require('../../../../test-helper');
const HigherSchoolingRegistrationParser = require('../../../../../lib/infrastructure/serializers/csv/higher-schooling-registration-parser');
const _ = require('lodash');

const higherSchoolingRegistrationColumns = HigherSchoolingRegistrationParser.COLUMNS.map((column) => column.label).join(';');

describe('Unit | Infrastructure | HigherSchoolingRegistrationParser', () => {
  context('when the header is correctly formed', () => {
    context('when there is no line', () => {
      it('returns an empty HigherSchoolingRegistrationSet', () => {
        const input = higherSchoolingRegistrationColumns;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new HigherSchoolingRegistrationParser(encodedInput, 123);

        const higherSchoolingRegistrationSet = parser.parse();

        expect(higherSchoolingRegistrationSet.registrations).to.be.empty;
      });
    });
    context('when there are lines', () => {
      it('returns a HigherSchoolingRegistrationSet with a schooling registration for each line', () => {
        const input = `${higherSchoolingRegistrationColumns}
        Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;
        `;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new HigherSchoolingRegistrationParser(encodedInput, 456);

        const higherSchoolingRegistrationSet = parser.parse();
        const registrations = higherSchoolingRegistrationSet.registrations;
        expect(registrations).to.have.lengthOf(2);
      });

      it('returns a HigherSchoolingRegistrationSet with a schooling registration for each line using the CSV column', () => {
        const input = `${higherSchoolingRegistrationColumns}
        Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;
        `;
        const organizationId = 789;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new HigherSchoolingRegistrationParser(encodedInput, organizationId);

        const higherSchoolingRegistrationSet = parser.parse();
        const registrations = _.sortBy(higherSchoolingRegistrationSet.registrations, 'preferredLastName');
        expect(registrations[0]).to.deep.equal({
          firstName: 'Beatrix',
          middleName: 'The',
          thirdName: 'Bride',
          lastName: 'Kiddo',
          preferredLastName: 'Black Mamba',
          studentNumber: '123456',
          email: 'thebride@example.net',
          birthdate: '1970-01-01',
          diploma: 'Master',
          department: 'Assassination Squad',
          educationalTeam: 'Hattori Hanzo',
          group: 'Deadly Viper Assassination Squad',
          studyScheme: 'hello darkness my old friend',
          organizationId,
          isSupernumerary: false,
        });
        expect(registrations[1]).to.deep.equal({
          firstName: 'O-Ren',
          middleName: undefined,
          thirdName: undefined,
          lastName: 'Ishii',
          preferredLastName: 'Cottonmouth',
          studentNumber: '789',
          email: 'ishii@example.net',
          birthdate: '1980-01-01',
          diploma: 'DUT',
          department: 'Assassination Squad',
          educationalTeam: 'Bill',
          group: 'Deadly Viper Assassination Squad',
          studyScheme: undefined,
          organizationId,
          isSupernumerary: false,
        });
      });
    });
  });

  context('When a column value does not match requirements', () => {
    const organizationId = 123;

    it('should throw an error if the student number is not unique', async () => {
      const input = `${higherSchoolingRegistrationColumns}
      Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
      Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new HigherSchoolingRegistrationParser(encodedInput, organizationId);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.contain('Ligne 3 : Le champ “Numéro étudiant” doit être unique au sein du fichier.');
    });

    it('should throw an error if the student number is has an incorrect  format', async () => {
      const input = `${higherSchoolingRegistrationColumns}
      Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123@;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
      Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1971;thebride@example.net;1234;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new HigherSchoolingRegistrationParser(encodedInput, organizationId);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.contain('Ligne 2 : Le champ “numéro étudiant” ne doit pas avoir de caractères spéciaux.');
    });
  });
});
