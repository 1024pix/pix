const { expect } = require('../../../test-helper');
const studentsXmlService = require('../../../../lib/domain/services/students-xml-service');

describe('Integration | Services | students-xml-service', () => {

  describe('extractStudentsInformations', () => {

    it('should parse in students informations', function() {
      // given
      const buffer = Buffer.from(
        '<?xml version="1.0" encoding="ISO-8859-15"?>' +
        '<BEE_ELEVES VERSION="2.1">' +
        '<DONNEES>' +
        '<ELEVES>' +
        '<ELEVE ELEVE_ID="0001">' +
        '<ID_NATIONAL>0000000001X</ID_NATIONAL>' +
        '<INE_RNIE>00000000123</INE_RNIE>' +
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
        '<ID_NATIONAL>0000000001X</ID_NATIONAL>' +
        '<INE_RNIE>00000000124</INE_RNIE>' +
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
        '</BEE_ELEVES>', 'latin1'); //FIXME 'latin9' is not supported (for œ)

      const expectedStudents = [{
        lastName: 'HANDMADE',
        preferredName: null,
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
        nationalId: '0000000001X',
        nationalStudentId: '00000000123',
        schoolClass: '4A'
      }, {
        lastName: 'COVERT',
        preferredName: 'COJAUNE',
        firstName: 'Harry',
        middleName: 'Coco',
        thirdName: null,
        birthdate: '1994-07-01',
        birthCity: 'LONDRES',
        birthCityCode: null,
        birthCountryCode: '132',
        birthProvinceCode: null,
        MEFCode: '12341234',
        status: 'ST',
        nationalId: '0000000001X',
        nationalStudentId: '00000000124',
        schoolClass: '4A'
      }];

      // when
      const result = studentsXmlService.extractStudentsInformations(buffer);

      //then
      expect(result).to.deep.equal(expectedStudents);
    });

    it('should not parse students who are no longer in the school', function() {
      // given
      const buffer = Buffer.from(
        '<?xml version="1.0" encoding="ISO-8859-15"?>' +
        '<BEE_ELEVES VERSION="2.1">' +
        '<DONNEES>' +
        '<ELEVES>' +
        '<ELEVE ELEVE_ID="0001">' +
        '<ID_NATIONAL>0000000001X</ID_NATIONAL>' +
        '<INE_RNIE>00000000123</INE_RNIE>' +
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
        '<ID_NATIONAL>0000000001X</ID_NATIONAL>' +
        '<INE_RNIE>00000000124</INE_RNIE>' +
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
        '</ELEVES>' +
        '<STRUCTURES>' +
        '<STRUCTURES_ELEVE ELEVE_ID="0002">' +
        '<STRUCTURE>' +
        '<CODE_STRUCTURE>Inactifs</CODE_STRUCTURE>' +
        '<TYPE_STRUCTURE>D</TYPE_STRUCTURE>' +
        '</STRUCTURE>' +
        '</STRUCTURES_ELEVE>' +
        '</STRUCTURES>' +
        '</DONNEES>' +
        '</BEE_ELEVES>', 'latin1'); //FIXME 'latin9' is not supported (for œ)

      const expectedStudents = [];

      // when
      const result = studentsXmlService.extractStudentsInformations(buffer);

      //then
      expect(result).to.deep.equal(expectedStudents);
    });
  });
});
