import fs from 'node:fs';

import { expect } from 'chai';
import xml2js from 'xml2js';

import { GenerateCpfXmlEventHandler } from '../../../../../src/certification/results/application/generate-cpf-xml.event-handler.ts';
import { Frameworks } from '../../../../../src/certification/shared/domain/models/Frameworks.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Acceptance | Application | Generate CPF XML Event Handler ', function () {
  describe('#handle', function () {
    it('should return a XML File', async function () {
      const session = await databaseBuilder.factory.buildSession();
      await databaseBuilder.factory.buildFinalizedSession({ sessionId: session.id });

      await databaseBuilder.factory.buildCertificationCourse({
        framework: Frameworks.CORE,
        sessionId: session.id,
        lastName: 'Lagagne',
        firstName: 'Max',
        birthdate: '2000-10-30',
        birthplace: 'Romorantin-Lanthenay',
        birthINSEECode: 41194,
        createdAt: new Date('2023-10-30'),
      });
      await databaseBuilder.factory.buildCertificationCourse({
        framework: Frameworks.CORE,
        sessionId: session.id,
        lastName: 'Winner',
        firstName: 'Max',
        birthdate: '2002-12-26',
        birthplace: 'Paris 15',
        birthINSEECode: 75115,
        createdAt: new Date('2023-10-29'),
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
      //console.log("result: ",parsedXmlData['cpf:fluxCreation']['cpf:emetteur']['cpf:certificateurs']['cpf:certificateur']['cpf:certifications']['cpf:certification']['cpf:passageCertifications'])
      //console.log("expect: ",parsedExpectedXml['cpf:fluxCreation']['cpf:emetteur']['cpf:certificateurs']['cpf:certificateur']['cpf:certifications']['cpf:certification']['cpf:passageCertifications'])
      expect(parsedXmlData).to.deep.equal(parsedExpectedXml);
    });
  });
});

function parseXml(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}
