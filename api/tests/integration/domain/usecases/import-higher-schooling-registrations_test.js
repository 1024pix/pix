const { expect, databaseBuilder, knex } = require('../../../test-helper');
const iconv = require('iconv-lite');

const importHigherSchoolingRegistration = require('../../../../lib/domain/usecases/import-higher-schooling-registrations');
const higherSchoolingRegistrationRepository = require('../../../../lib/infrastructure/repositories/higher-schooling-registration-repository');
const HigherSchoolingRegistrationParser = require('../../../../lib/infrastructure/serializers/csv/higher-schooling-registration-parser');

describe('Integration | UseCase | ImportHigherSchoolingRegistration', () => {

  afterEach(() => {
    return knex('schooling-registrations').delete();
  });

  it('parses the csv received and creates the HigherSchoolingRegistration', async () => {
    const input = `Premier prénom;Deuxième prénom;Troisième prénom;Nom de famille;Nom d’usage;Date de naissance (jj/mm/aaaa);Email;Numéro étudiant;Composante;Équipe pédagogique;Groupe;Diplôme;Régime
        Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;thebride@example.net;12346;Assassination Squad;Hattori Hanzo;Deadly Viper Assassination Squad;Master;hello darkness my old friend;
        O-Ren;;;Ishii;Cottonmouth;01/01/1980;ishii@example.net;789;Assassination Squad;Bill;Deadly Viper Assassination Squad;DUT;;
    `.trim();

    const encodedInput = iconv.encode(input, 'utf8');

    const organization = databaseBuilder.factory.buildOrganization();
    await databaseBuilder.commit();
    await importHigherSchoolingRegistration({ higherSchoolingRegistrationRepository, higherSchoolingRegistrationParser: new HigherSchoolingRegistrationParser(encodedInput, organization.id) });

    const registrations = await knex('schooling-registrations').where({ organizationId: organization.id });
    expect(registrations).to.have.lengthOf(2);
  });

});
