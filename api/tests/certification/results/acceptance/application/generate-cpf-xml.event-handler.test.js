import fs from 'node:fs';

import { expect } from 'chai';
import xml2js from 'xml2js';

import { GenerateCpfXmlEventHandler } from '../../../../../src/certification/results/application/generate-cpf-xml.event-handler.ts';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Acceptance | Application | Generate CPF XML Event Handler ', function () {
  describe('#handle', function () {
    it('should return a XML File', async function () {
      const session = await databaseBuilder.factory.buildSession();

      /*
      'cpf:codeCommuneNaissance': [Object],
      */
      const firstUser = await databaseBuilder.factory.buildUser();
      const firstCertifResult = await databaseBuilder.factory.buildCertificationResult({
        deliveredAt: new Date('2023-10-30'),
        firstName: 'Max',
        middleName: 'PRENOM-DEUX',
        thirdName: 'PRENOM-TROIS',
        lastName: 'Lagagne',
        birthdate: '2000-10-30',
        birthINSEECode: '41194',
        birthplace: 'Romorantin-Lanthenay',
      });
      await databaseBuilder.factory.buildUserCertificationResult({
        userId: firstUser.id,
        sessionId: session.id,
        certificationResultId: firstCertifResult.id,
      });
      const secondUser = await databaseBuilder.factory.buildUser();
      const secondCertifResult = await databaseBuilder.factory.buildCertificationResult({
        deliveredAt: new Date('2023-10-29'),
        firstName: 'Max',
        middleName: 'PRENOM-DEUX',
        thirdName: 'PRENOM-TROIS',
        lastName: 'Lagagne',
        birthdate: '2000-10-30',
        birthINSEECode: '41194',
        birthplace: 'Romorantin-Lanthenay',
      });
      await databaseBuilder.factory.buildUserCertificationResult({
        userId: secondUser.id,
        sessionId: session.id,
        certificationResultId: secondCertifResult.id,
      });

      await databaseBuilder.commit();

      const handler = new GenerateCpfXmlEventHandler();
      const data = {
        sessionId: session.id,
      };
      const xmlData = await handler.handle({ data, uuid: '6e3c7378-xxx0-497a-0xx0-dc405f903ed9' });
      const parsedXmlData = await parseXml(xmlData);

      // eslint-disable-next-line n/no-sync
      const expectedXmlFile = fs
        .readFileSync('tests/certification/results/acceptance/application/cpf-creation_exemple.xml', 'utf8')
        .replace(/[\n\r]+/g, '');
      const parsedExpectedXml = await parseXml(expectedXmlFile);
      //console.log('result: ', debug(parsedXmlData));
      //console.log('expect: ', debug(parsedExpectedXml));
      expect(parsedXmlData).to.deep.equal(parsedExpectedXml);
    });
  });
});

/*
function debug(xmlDom) {
  const base =
    xmlDom['cpf:fluxCreation']['cpf:emetteur']['cpf:certificateurs']['cpf:certificateur']['cpf:certifications'][
      'cpf:certification'
    ]['cpf:passageCertifications'];
  return base['cpf:passageCertification'][0]['cpf:identificationTitulaire']['cpf:titulaire'];
}
*/

function parseXml(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}
