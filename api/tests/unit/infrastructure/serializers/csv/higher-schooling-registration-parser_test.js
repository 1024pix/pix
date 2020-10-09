const iconv = require('iconv-lite');
const { expect, catchErr } = require('../../../../test-helper');
const HigherSchoolingRegistrationParser = require('../../../../../lib/infrastructure/serializers/csv/higher-schooling-registration-parser');
const _ = require('lodash');

describe('Unit | Infrastructure | HigherSchoolingRegistrationParser', () => {
  context('when the header is correctly formed', () => {
    context('when there is no line', () => {
      it('returns an empty HigherSchoolingRegistrationSet', () => {
        const input = 'Premier prénom;Deuxième prénom;Troisième prénom;Nom de famille;Nom d’usage;Date de naissance (jj/mm/aaaa);Email;Numéro étudiant;Composante;Équipe pédagogique;Groupe;Diplôme;Régime';
        const encodedInput = iconv.encode(input, 'utf8');
        const parser = new HigherSchoolingRegistrationParser(encodedInput, 123);

        const higherSchoolingRegistrationSet = parser.parse();

        expect(higherSchoolingRegistrationSet.registrations).to.be.empty;
      });
    });
    context('when there are lines', () => {
      it('returns a HigherSchoolingRegistrationSet with a schooling registration for each line', () => {
        const input = `Premier prénom;Deuxième prénom;Troisième prénom;Nom de famille;Nom d’usage;Date de naissance (jj/mm/aaaa);Email;Numéro étudiant;Composante;Équipe pédagogique;Groupe;Diplôme;Régime
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
        const input = `Premier prénom;Deuxième prénom;Troisième prénom;Nom de famille;Nom d’usage;Date de naissance (jj/mm/aaaa);Email;Numéro étudiant;Composante;Équipe pédagogique;Groupe;Diplôme;Régime
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

    it('should throw an error if column value exceed 255 characters', async () => {
      const input = `Premier prénom;Deuxième prénom;Troisième prénom;Nom de famille;Nom d’usage;Date de naissance (jj/mm/aaaa);Email;Numéro étudiant;Composante;Équipe pédagogique;Groupe;Diplôme;Régime
      Beatrix;Thhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhe;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new HigherSchoolingRegistrationParser(encodedInput, organizationId);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.contain('Le champ “Deuxième prénom” doit être inférieur à 255 caractères.');
    });

    it('should throw an error if the birthdate does not have the right format', async () => {
      const input = `Premier prénom;Deuxième prénom;Troisième prénom;Nom de famille;Nom d’usage;Date de naissance (jj/mm/aaaa);Email;Numéro étudiant;Composante;Équipe pédagogique;Groupe;Diplôme;Régime
      Beatrix;The;Bride;Kiddo;Black Mamba;1970/01/01;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new HigherSchoolingRegistrationParser(encodedInput, organizationId);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.contain('Le champ “Date de naissance” doit être au format jj/mm/aaaa.');
    });

    it('should throw an error if a required field is missing', async () => {
      const input = `Premier prénom;Deuxième prénom;Troisième prénom;Nom de famille;Nom d’usage;Date de naissance (jj/mm/aaaa);Email;Numéro étudiant;Composante;Équipe pédagogique;Groupe;Diplôme;Régime
      Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new HigherSchoolingRegistrationParser(encodedInput, organizationId);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.contain('Le champ “Numéro étudiant” est obligatoire.');
    });

    it('should throw an error if the student number is not unique', async () => {
      const input = `Premier prénom;Deuxième prénom;Troisième prénom;Nom de famille;Nom d’usage;Date de naissance (jj/mm/aaaa);Email;Numéro étudiant;Composante;Équipe pédagogique;Groupe;Diplôme;Régime
      Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
      Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new HigherSchoolingRegistrationParser(encodedInput, organizationId);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.contain('Le champ “Numéro étudiant” doit être unique au sein du fichier.');
    });

    it('should throw an error including line number', async () => {
      const input = `Premier prénom;Deuxième prénom;Troisième prénom;Nom de famille;Nom d’usage;Date de naissance (jj/mm/aaaa);Email;Numéro étudiant;Composante;Équipe pédagogique;Groupe;Diplôme;Régime
      Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
      Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;`;
      const encodedInput = iconv.encode(input, 'utf8');
      const parser = new HigherSchoolingRegistrationParser(encodedInput, organizationId);

      const error = await catchErr(parser.parse, parser)();

      expect(error.message).to.contain('Ligne 3 :');
    });
  });
});
