const iconv = require('iconv-lite');
const { expect, catchErr } = require('../../../../test-helper');
const SchoolingRegistrationParser = require('../../../../../lib/infrastructure/serializers/csv/schooling-registration-parser');

describe('Unit | Infrastructure | SchoolingRegistrationParser', () => {
  context('when the header is correctly formed', () => {
    context('when there is no line', () => {
      it('returns no registrations', () => {
        const input = 'Identifiant unique*;Premier prénom*;Deuxième prénom;Troisième prénom;Nom de famille*;Nom d’usage;Date de naissance (jj/mm/aaaa)*;Code commune naissance**;Libellé commune naissance**;Code département naissance*;Code pays naissance*;Statut*;Code MEF*;Division*';
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new SchoolingRegistrationParser(encodedInput, 123);

        const registrations = parser.parse();

        expect(registrations).to.be.empty;
      });
    });
    context('when there are lines', () => {
      it('returns a schooling registration for each line', () => {
        const input = `Identifiant unique*;Premier prénom*;Deuxième prénom;Troisième prénom;Nom de famille*;Nom d’usage;Date de naissance (jj/mm/aaaa)*;Code commune naissance**;Libellé commune naissance**;Code département naissance*;Code pays naissance*;Statut*;Code MEF*;Division*
        123F;Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;97422;;200;99100;ST;MEF1;Division 1;
        456F;O-Ren;;;Ishii;Cottonmouth;01/01/1980;;Shangai;99;99132;ST;MEF1;Division 2;
        `;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new SchoolingRegistrationParser(encodedInput, 456);

        const registrations = parser.parse();
        expect(registrations).to.have.lengthOf(2);
      });

      it('returns schooling registrations for each line using the CSV column', () => {
        const input = `Identifiant unique*;Premier prénom*;Deuxième prénom;Troisième prénom;Nom de famille*;Nom d’usage;Date de naissance (jj/mm/aaaa)*;Code commune naissance**;Libellé commune naissance**;Code département naissance*;Code pays naissance*;Statut*;Code MEF*;Division*
        123F;Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;97422;;974;99100;ST;MEF1;Division 1;
        456F;O-Ren;;;Ishii;Cottonmouth;01/01/1980;;Shangai;99;99132;ST;MEF1;Division 2;
        `;
        const organizationId = 789;
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new SchoolingRegistrationParser(encodedInput, organizationId);

        const registrations = parser.parse();
        expect(registrations[0]).to.includes({
          nationalStudentId: '123F',
          firstName: 'Beatrix',
          middleName: 'The',
          thirdName: 'Bride',
          lastName: 'Kiddo',
          preferredLastName: 'Black Mamba',
          birthdate: '1970-01-01',
          birthCityCode: '97422',
          birthProvinceCode: '974',
          birthCountryCode: '100',
          status: 'ST',
          MEFCode: 'MEF1',
          division: 'Division 1',
          organizationId,
        });
        expect(registrations[1]).to.includes({
          nationalStudentId: '456F',
          firstName: 'O-Ren',
          lastName: 'Ishii',
          preferredLastName: 'Cottonmouth',
          birthdate: '1980-01-01',
          birthCity: 'Shangai',
          birthProvinceCode: '99',
          birthCountryCode: '132',
          status: 'ST',
          MEFCode: 'MEF1',
          division: 'Division 2',
          organizationId,
        });
      });
    });
  });

  context('When a column value does not match requirements', () => {
    const organizationId = 123;

    it('should throw an error if column value exceed 255 characters', async () => {
      const input = `Identifiant unique*;Premier prénom*;Deuxième prénom;Troisième prénom;Nom de famille*;Nom d’usage;Date de naissance (jj/mm/aaaa)*;Code commune naissance**;Libellé commune naissance**;Code département naissance*;Code pays naissance*;Statut*;Code MEF*;Division*
        123F;Beatrix;Thhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhe;Bride;Kiddo;Black Mamba;01/01/1970;97422;;91200A;99100;ST;MEF1;Division 1;
        `;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new SchoolingRegistrationParser(encodedInput, organizationId);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.contain('Le champ “Deuxième prénom” doit être inférieur à 255 caractères.');
    });

    it('should throw an error if the birthdate does not have the right format', async () => {
      const input = `Identifiant unique*;Premier prénom*;Deuxième prénom;Troisième prénom;Nom de famille*;Nom d’usage;Date de naissance (jj/mm/aaaa)*;Code commune naissance**;Libellé commune naissance**;Code département naissance*;Code pays naissance*;Statut*;Code MEF*;Division*
        123F;Beatrix;The;Bride;Kiddo;Black Mamba;1970/01/01;97422;;91200A;99100;ST;MEF1;Division 1;
        `;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new SchoolingRegistrationParser(encodedInput, organizationId);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.contain('Le champ “Date de naissance (jj/mm/aaaa)*” doit être au format jj/mm/aaaa.');
    });

    it('should throw an error if birth city code value exceed 5 characters', async () => {
      const input = `Identifiant unique*;Premier prénom*;Deuxième prénom;Troisième prénom;Nom de famille*;Nom d’usage;Date de naissance (jj/mm/aaaa)*;Code commune naissance**;Libellé commune naissance**;Code département naissance*;Code pays naissance*;Statut*;Code MEF*;Division*
        123F;Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;123456;;123;99100;ST;MEF1;Division 1;
        `;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new SchoolingRegistrationParser(encodedInput, organizationId);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.contain('Le champ “Code commune naissance**” doit être inférieur à 5 caractères.');
    });

    it('should throw an error if birth province code value exceed 3 characters', async () => {
      const input = `Identifiant unique*;Premier prénom*;Deuxième prénom;Troisième prénom;Nom de famille*;Nom d’usage;Date de naissance (jj/mm/aaaa)*;Code commune naissance**;Libellé commune naissance**;Code département naissance*;Code pays naissance*;Statut*;Code MEF*;Division*
        123F;Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;12345;;1234;99100;ST;MEF1;Division 1;
        `;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new SchoolingRegistrationParser(encodedInput, organizationId);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.contain('Le champ “Code département naissance*” doit être inférieur à 3 caractères.');
    });

    it('should throw an error if birth country code value exceed 5 characters', async () => {
      const input = `Identifiant unique*;Premier prénom*;Deuxième prénom;Troisième prénom;Nom de famille*;Nom d’usage;Date de naissance (jj/mm/aaaa)*;Code commune naissance**;Libellé commune naissance**;Code département naissance*;Code pays naissance*;Statut*;Code MEF*;Division*
        123F;Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;12345;12;123;1234567;ST;MEF1;Division 1;
        `;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new SchoolingRegistrationParser(encodedInput, organizationId);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.contain('Le champ “Code pays naissance*” doit être inférieur à 5 caractères.');
    });

    it('should throw an error if a french person does not have a birth city code', async () => {
      const input = `Identifiant unique*;Premier prénom*;Deuxième prénom;Troisième prénom;Nom de famille*;Nom d’usage;Date de naissance (jj/mm/aaaa)*;Code commune naissance**;Libellé commune naissance**;Code département naissance*;Code pays naissance*;Statut*;Code MEF*;Division*
        123F;Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;;;123;99100;ST;MEF1;Division 1;
        `;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new SchoolingRegistrationParser(encodedInput, organizationId);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.contain('Le champ “Code commune naissance**” est obligatoire.');
    });

    it('should throw an error if a foreign person does not have a birth city label', async () => {
      const input = `Identifiant unique*;Premier prénom*;Deuxième prénom;Troisième prénom;Nom de famille*;Nom d’usage;Date de naissance (jj/mm/aaaa)*;Code commune naissance**;Libellé commune naissance**;Code département naissance*;Code pays naissance*;Statut*;Code MEF*;Division*
        123F;Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;97422;;;99132;ST;MEF1;Division 1;
        `;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new SchoolingRegistrationParser(encodedInput, organizationId);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.contain('Le champ “Libellé commune naissance**” est obligatoire.');
    });

    it('should throw an error if a required field is missing', async () => {
      const input = `Identifiant unique*;Premier prénom*;Deuxième prénom;Troisième prénom;Nom de famille*;Nom d’usage;Date de naissance (jj/mm/aaaa)*;Code commune naissance**;Libellé commune naissance**;Code département naissance*;Code pays naissance*;Statut*;Code MEF*;Division*
        123F;Beatrix;The;Bride;;Black Mamba;01/01/1970;97422;;91200A;99100;ST;MEF1;Division 1;
        `;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new SchoolingRegistrationParser(encodedInput, organizationId);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.contain('Le champ “Nom de famille*” est obligatoire.');
    });

    it('should throw an error if the status field is not a correct value', async () => {
      const input = `Identifiant unique*;Premier prénom*;Deuxième prénom;Troisième prénom;Nom de famille*;Nom d’usage;Date de naissance (jj/mm/aaaa)*;Code commune naissance**;Libellé commune naissance**;Code département naissance*;Code pays naissance*;Statut*;Code MEF*;Division*
        123F;Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;97422;;200;99100;AA;MEF1;Division 1;
        `;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new SchoolingRegistrationParser(encodedInput, organizationId);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.contain('Le champ “Statut*” doit être "ST ou AP".');
    });

    it('should throw an error including line number', async () => {
      const input = `Identifiant unique*;Premier prénom*;Deuxième prénom;Troisième prénom;Nom de famille*;Nom d’usage;Date de naissance (jj/mm/aaaa)*;Code commune naissance**;Libellé commune naissance**;Code département naissance*;Code pays naissance*;Statut*;Code MEF*;Division*
        123F;Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;97422;;200;99100;ST;MEF1;Division 1;
        456F;O-Ren;;;;Cottonmouth;01/01/1980;;Shangai;99;99132;ST;MEF1;Division 2;
        `;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new SchoolingRegistrationParser(encodedInput, organizationId);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.contain('Ligne 3 :');
    });
  });
});
