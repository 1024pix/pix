import fs from 'fs';
import path from 'path';
import * as url from 'url';
import { deserialize } from '../../../../../../../src/certification/session/infrastructure/deserializers/xml/cpf-receipt-file-deserializer.js';
import { catchErr, expect } from '../../../../../../test-helper.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Unit | Deserializer | XML | cpf-receipt-file-deserializer', function () {
  describe('#deserialize()', function () {
    it('should deserialize a valid CPF receipt', async function () {
      // given
      const xmlStream = fs.createReadStream(
        path.join(__dirname, 'files/Accuse_de_traitement_pix-cpf-export-20231016-223239.xml_20231018.xml'),
        'utf8',
      );
      // when
      const cpfInfos = await deserialize({ xmlStream });

      // then
      expect(cpfInfos).to.deep.equal([
        { certificationCourseId: '1979262', filename: 'pix-cpf-export-20231016-223239.xml', importStatus: 'REJECTED' },
        { certificationCourseId: '1996215', filename: 'pix-cpf-export-20231016-223239.xml', importStatus: 'REJECTED' },
        { certificationCourseId: '1983189', filename: 'pix-cpf-export-20231016-223239.xml', importStatus: 'SUCCESS' },
        { certificationCourseId: '1968666', filename: 'pix-cpf-export-20231016-223239.xml', importStatus: 'SUCCESS' },
        { certificationCourseId: '1964200', filename: 'pix-cpf-export-20231016-223239.xml', importStatus: 'SUCCESS' },
      ]);
    });

    it('should reject a cpf receipt without node "nomFichier"', async function () {
      // given
      const xmlStream = fs.createReadStream(
        path.join(__dirname, 'files/Accuse_de_traitement_sans_nomFichier.xml'),
        'utf8',
      );
      // when
      const error = await catchErr(deserialize)({ xmlStream });

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal('Invalid cpf receipt, nomFichier should be an XML node');
    });

    it('should reject a cpf receipt that is in error', async function () {
      // given
      const xmlStream = fs.createReadStream(
        path.join(__dirname, 'files/Accuse_de_traitement_erreur_traitement.xml'),
        'utf8',
      );
      // when
      const cpfInfos = await deserialize({ xmlStream });

      // then
      expect(cpfInfos).to.deep.equal([]);
    });
  });
});
