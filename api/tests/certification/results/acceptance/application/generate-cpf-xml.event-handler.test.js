import fs from 'node:fs';

import { expect } from 'chai';

import { GenerateCpfXmlEventHandler } from '../../../../../src/certification/results/application/generate-cpf-xml.event-handler.ts';
import { Frameworks } from '../../../../../src/certification/shared/domain/models/Frameworks.js';
import { AssessmentResult } from '../../../../../src/shared/domain/models/AssessmentResult.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Acceptance | Application | Generate CPF XML Event Handler ', function () {
  describe('#handle', function () {
    it('should return a XML File', async function () {
      const session = await databaseBuilder.factory.buildSession();
      await databaseBuilder.factory.buildFinalizedSession({ sessionId: session.id });

      await databaseBuilder.factory.buildCertificate({
        status: AssessmentResult.status.VALIDATED,
        framework: Frameworks.CORE,
      });

      await databaseBuilder.commit();

      const handler = new GenerateCpfXmlEventHandler();
      const data = {
        sessionId: session.id,
      };
      const xmlFile = await handler.handle({ data, uuid: '6e3c7378-xxx0-497a-0xx0-dc405f903ed9' });

      const expectedXmlFile = fs
        .readFileSync('tests/certification/results/acceptance/application/cpf-creation_exemple.xml', 'utf8')
        .replace(/[\n\r]+/g, '');
      expect(xmlFile).to.deep.equal(expectedXmlFile);
    });
  });
});
