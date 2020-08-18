const { expect } = require('../../../../test-helper');
const HigherEducationRegistrationParser = require('../../../../../lib/infrastructure/serializers/csv/higher-education-registration-parser');
const _ = require('lodash');

describe('HigherEducationRegistrationParser', () => {
  context('when the header is correctly formed', () => {
    context('when there is no line', () => {
      it('returns an empty HigherEducationRegistrationSet', () => {
        const input = 'Premier prénom;Deuxième prénom;Troisième prénom;Nom de famille;Nom d’usage;Date de naissance (jj/mm/aaaa);Email;Numéro étudiant;Composante;Équipe pédagogique;Groupe;Diplôme;Régime';
        const parser = new HigherEducationRegistrationParser(input);

        const higherEducationRegistrationSet = parser.parse();

        expect(higherEducationRegistrationSet.registrations).to.be.empty;
      });
    });
    context('when there are lines', () => {
      it('returns a HigherEducationRegistrationSet with a schooling registration for each line', () => {
        const input = `Premier prénom;Deuxième prénom;Troisième prénom;Nom de famille;Nom d’usage;Date de naissance (jj/mm/aaaa);Email;Numéro étudiant;Composante;Équipe pédagogique;Groupe;Diplôme;Régime
        Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;
        `;
        const parser = new HigherEducationRegistrationParser(input);

        const higherEducationRegistrationSet = parser.parse();
        const registrations = higherEducationRegistrationSet.registrations;
        expect(registrations).to.have.lengthOf(2);
      });

      it('returns a HigherEducationRegistrationSet with a schooling registration for each line using the CSV column', () => {
        const input = `Premier prénom;Deuxième prénom;Troisième prénom;Nom de famille;Nom d’usage;Date de naissance (jj/mm/aaaa);Email;Numéro étudiant;Composante;Équipe pédagogique;Groupe;Diplôme;Régime
        Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;123456;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;
        `;
        const parser = new HigherEducationRegistrationParser(input);

        const higherEducationRegistrationSet = parser.parse();
        const registrations = _.sortBy(higherEducationRegistrationSet.registrations, 'preferredLastName');
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
          isSupernumerary: false,
          organizationId: undefined,
          group: 'Deadly Viper Assassination Squad',
          studyScheme: 'hello darkness my old friend',
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
          isSupernumerary: false,
          organizationId: undefined,
          group: 'Deadly Viper Assassination Squad',
          studyScheme: undefined,
        });
      });
    });
  });
});
