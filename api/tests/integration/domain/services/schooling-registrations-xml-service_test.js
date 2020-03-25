const { expect } = require('../../../test-helper');
const schoolingRegistrationsXmlService = require('../../../../lib/domain/services/schooling-registrations-xml-service');

const iconv = require('iconv-lite');

describe('Integration | Services | schooling-registrations-xml-service', () => {

  describe('extractSchoolingRegistrationsInformationFromSIECLE', () => {

    it('should parse in schoolingRegistrations informations', function() {
      // given
      const buffer = iconv.encode(
        '<?xml version="1.0" encoding="ISO-8859-15"?>' +
        '<BEE_ELEVES VERSION="2.1">' +
        '<DONNEES>' +
        '<ELEVES>' +
        '<ELEVE ELEVE_ID="0001">' +
        '<ID_NATIONAL>00000000123</ID_NATIONAL>' +
        '<NOM_DE_FAMILLE>HANDMADE</NOM_DE_FAMILLE>' +
        '<NOM_USAGE></NOM_USAGE>' +
        '<PRENOM>Luciole</PRENOM>' +
        '<PRENOM2>Léa</PRENOM2>' +
        '<PRENOM3>Lucy</PRENOM3>' +
        '<DATE_NAISS>31/12/1994</DATE_NAISS>' +
        '<CODE_PAYS>100</CODE_PAYS>' +
        '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
        '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
        '<CODE_MEF>123456789</CODE_MEF>' +
        '<CODE_STATUT>AP</CODE_STATUT>' +
        '</ELEVE>' +
        '<ELEVE ELEVE_ID="0002">' +
        '<ID_NATIONAL>00000000124</ID_NATIONAL>' +
        '<NOM_DE_FAMILLE>COVERT</NOM_DE_FAMILLE>' +
        '<NOM_USAGE>COJAUNE</NOM_USAGE>' +
        '<PRENOM>Harry</PRENOM>' +
        '<PRENOM2>Cocœ</PRENOM2>' +
        '<PRENOM3></PRENOM3>' +
        '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
        '<CODE_PAYS>132</CODE_PAYS>' +
        '<VILLE_NAISS>LONDRES</VILLE_NAISS>' +
        '<CODE_MEF>12341234</CODE_MEF>' +
        '<CODE_STATUT>ST</CODE_STATUT>' +
        '</ELEVE>' +
        '</ELEVES>' +
        '<STRUCTURES>' +
        '<STRUCTURES_ELEVE ELEVE_ID="0001">' +
        '<STRUCTURE>' +
        '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
        '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
        '</STRUCTURE>' +
        '</STRUCTURES_ELEVE>' +
        '<STRUCTURES_ELEVE ELEVE_ID="0002">' +
        '<STRUCTURE>' +
        '<CODE_STRUCTURE>42</CODE_STRUCTURE>' +
        '<TYPE_STRUCTURE>G</TYPE_STRUCTURE>' +
        '</STRUCTURE>' +
        '<STRUCTURE>' +
        '<CODE_STRUCTURE>4A</CODE_STRUCTURE>' +
        '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
        '</STRUCTURE>' +
        '</STRUCTURES_ELEVE>' +
        '</STRUCTURES>' +
        '</DONNEES>' +
        '</BEE_ELEVES>', 'ISO-8859-15');

      const expectedSchoolingRegistrations = [{
        lastName: 'HANDMADE',
        preferredLastName: '',
        firstName: 'Luciole',
        middleName: 'Léa',
        thirdName: 'Lucy',
        birthdate: '1994-12-31',
        birthCityCode: '33318',
        birthCity: null,
        birthCountryCode: '100',
        birthProvinceCode: '033',
        MEFCode: '123456789',
        status: 'AP',
        nationalStudentId: '00000000123',
        division: '4A'
      }, {
        lastName: 'COVERT',
        preferredLastName: 'COJAUNE',
        firstName: 'Harry',
        middleName: 'Cocœ',
        thirdName: '',
        birthdate: '1994-07-01',
        birthCity: 'LONDRES',
        birthCityCode: null,
        birthCountryCode: '132',
        birthProvinceCode: null,
        MEFCode: '12341234',
        status: 'ST',
        nationalStudentId: '00000000124',
        division: '4A'
      }];

      // when
      const result = schoolingRegistrationsXmlService.extractSchoolingRegistrationsInformationFromSIECLE(buffer);

      //then
      expect(result).to.deep.equal(expectedSchoolingRegistrations);
    });

    it('should not parse schoolingRegistrations who are no longer in the school', function() {
      // given
      const buffer = iconv.encode(
        '<?xml version="1.0" encoding="ISO-8859-15"?>' +
        '<BEE_ELEVES VERSION="2.1">' +
        '<DONNEES>' +
        '<ELEVES>' +
        '<ELEVE ELEVE_ID="0001">' +
        '<ID_NATIONAL>00000000123</ID_NATIONAL>' +
        '<NOM_DE_FAMILLE>HANDMADE</NOM_DE_FAMILLE>' +
        '<NOM_USAGE></NOM_USAGE>' +
        '<PRENOM>Luciole</PRENOM>' +
        '<PRENOM2>Léa</PRENOM2>' +
        '<PRENOM3>Lucy</PRENOM3>' +
        '<DATE_NAISS>31/12/1994</DATE_NAISS>' +
        '<CODE_PAYS>100</CODE_PAYS>' +
        '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
        '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
        '<CODE_MEF>123456789</CODE_MEF>' +
        '<CODE_STATUT>AP</CODE_STATUT>' +
        '</ELEVE>' +
        '<ELEVE ELEVE_ID="0002">' +
        '<ID_NATIONAL>00000000124</ID_NATIONAL>' +
        '<NOM_DE_FAMILLE>COVERT</NOM_DE_FAMILLE>' +
        '<NOM_USAGE>COJAUNE</NOM_USAGE>' +
        '<PRENOM>Harry</PRENOM>' +
        '<PRENOM2>Coco</PRENOM2>' +
        '<PRENOM3></PRENOM3>' +
        '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
        '<CODE_PAYS>132</CODE_PAYS>' +
        '<VILLE_NAISS>LONDRES</VILLE_NAISS>' +
        '<CODE_MEF>12341234</CODE_MEF>' +
        '<CODE_STATUT>ST</CODE_STATUT>' +
        '</ELEVE>' +
        '<ELEVE ELEVE_ID="0003">' +
        '<NOM_DE_FAMILLE>FRANCIS--FROUFROU</NOM_DE_FAMILLE>' +
        '<PRENOM>Grégory</PRENOM>' +
        '<DATE_NAISS>01/07/1994</DATE_NAISS>' +
        '<CODE_PAYS>100</CODE_PAYS>' +
        '<CODE_DEPARTEMENT_NAISS>035</CODE_DEPARTEMENT_NAISS>' +
        '<CODE_COMMUNE_INSEE_NAISS>35133</CODE_COMMUNE_INSEE_NAISS>' +
        '<CODE_MEF>12341234</CODE_MEF>' +
        '<CODE_STATUT>AP</CODE_STATUT>' +
        '</ELEVE>' +
        '</ELEVE>' +
        '<ELEVE ELEVE_ID="0004">' +
        '<ID_NATIONAL>00000000125</ID_NATIONAL>' +
        '<NOM_DE_FAMILLE>FRANGE</NOM_DE_FAMILLE>' +
        '<PRENOM>COLIN</PRENOM>' +
        '<DATE_NAISS>31/12/1994</DATE_NAISS>' +
        '<CODE_PAYS>100</CODE_PAYS>' +
        '<CODE_DEPARTEMENT_NAISS>75</CODE_DEPARTEMENT_NAISS>' +
        '<CODE_COMMUNE_INSEE_NAISS>75009</CODE_COMMUNE_INSEE_NAISS>' +
        '<CODE_MEF>12341234</CODE_MEF>' +
        '<CODE_STATUT>AP</CODE_STATUT>' +
        '</ELEVE>' +
        '<ELEVE ELEVE_ID="0005">' +
        '<ID_NATIONAL>00000000126</ID_NATIONAL>' +
        '<NOM_DE_FAMILLE>GRADE</NOM_DE_FAMILLE>' +
        '<PRENOM>François</PRENOM>' +
        '<DATE_NAISS>12/12/2008</DATE_NAISS>' +
        '<DATE_SORTIE>01/09/2019</DATE_SORTIE>' +
        '<CODE_PAYS>100</CODE_PAYS>' +
        '<CODE_DEPARTEMENT_NAISS>033</CODE_DEPARTEMENT_NAISS>' +
        '<CODE_COMMUNE_INSEE_NAISS>33318</CODE_COMMUNE_INSEE_NAISS>' +
        '<CODE_MEF>123456789</CODE_MEF>' +
        '<CODE_STATUT>AP</CODE_STATUT>' +
        '</ELEVE>' +
        '</ELEVES>' +
        '<STRUCTURES>' +
        '<STRUCTURES_ELEVE ELEVE_ID="0002">' +
        '<STRUCTURE>' +
        '<CODE_STRUCTURE>Inactifs</CODE_STRUCTURE>' +
        '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
        '</STRUCTURE>' +
        '</STRUCTURES_ELEVE>' +
        '<STRUCTURES_ELEVE ELEVE_ID="0003">' +
        '<STRUCTURE>' +
        '<CODE_STRUCTURE>4e 1</CODE_STRUCTURE>' +
        '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
        '</STRUCTURE>' +
        '</STRUCTURES_ELEVE>' +
        '<STRUCTURES_ELEVE ELEVE_ID="0004">' +
        '<STRUCTURE>' +
        '<CODE_STRUCTURE>4e 1</CODE_STRUCTURE>' +
        '<TYPE_STRUCTURE>G</TYPE_STRUCTURE>' +
        '</STRUCTURE>' +
        '</STRUCTURES_ELEVE>' +
        '<STRUCTURES_ELEVE ELEVE_ID="0005">' +
        '<STRUCTURE>' +
        '<CODE_STRUCTURE>4e 1</CODE_STRUCTURE>' +
        '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
        '</STRUCTURE>' +
        '</STRUCTURES_ELEVE>' +
        '</STRUCTURES>' +
        '</DONNEES>' +
        '</BEE_ELEVES>', 'ISO-8859-15');

      const expectedSchoolingRegistrations = [];

      // when
      const result = schoolingRegistrationsXmlService.extractSchoolingRegistrationsInformationFromSIECLE(buffer);

      //then
      expect(result).to.deep.equal(expectedSchoolingRegistrations);
    });
  });
});
