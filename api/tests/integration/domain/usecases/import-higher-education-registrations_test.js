const { expect, databaseBuilder, knex } = require('../../../test-helper');
const iconv = require('iconv-lite');

const importHigherEducationRegistration = require('../../../../lib/domain/usecases/import-higher-education-registrations');
const higherEducationRegistrationRepository = require('../../../../lib/infrastructure/repositories/higher-education-registration-repository');
const HigherEducationRegistrationParser = require('../../../../lib/infrastructure/serializers/csv/higher-education-registration-parser');

describe('Integration | UseCase | ImportHigherEducationRegistration', () => {

  afterEach(() => {
    return knex('schooling-registrations').delete();
  });

  it('parses the csv received and creates the HigherEducationRegistration', async () => {
    const input = `Premier prénom;Deuxième prénom;Troisième prénom;Nom de famille;Nom d’usage;Date de naissance (jj/mm/aaaa);Email;Numéro étudiant;Composante;Équipe pédagogique;Groupe;Diplôme;Régime
        Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;
    `.trim();

    const encodedInput = iconv.encode(input, 'utf8');

    const organization = databaseBuilder.factory.buildOrganization();
    await databaseBuilder.commit();
    await importHigherEducationRegistration({ higherEducationRegistrationRepository, higherEducationRegistrationParser: new HigherEducationRegistrationParser(encodedInput, organization.id) });

    const registrations = await knex('schooling-registrations').where({ organizationId: organization.id });
    expect(registrations).to.have.lengthOf(2);
  });

});
