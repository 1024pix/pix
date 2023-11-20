import sax from 'sax';
import saxPath from 'saxpath';
import xml2js from 'xml2js';
import { _ } from '../../../../../shared/infrastructure/utils/lodash-utils.js';
import { CpfImportStatus } from '../../../domain/models/CpfImportStatus.js';
import { CpfInfos } from '../../../domain/models/CpfInfos.js';

export const deserialize = async ({ xmlStream }) => {
  const cpfReceiptFileDeserializer = new CpfReceiptFileDeserializer();
  return cpfReceiptFileDeserializer.deserialize({ xmlStream });
};

class CpfReceiptFileDeserializer {
  #successfullImports = new Set();
  #rejectedImports = new Set();
  #pixFilename;

  #parseXml({ xmlStream }) {
    const saxParser = sax.createStream(true);

    const pixFilenameParser = new saxPath.SaXPath(saxParser, '/rapport/nomFichier');
    pixFilenameParser.on('match', (xmlNode) => {
      xml2js.parseString(xmlNode, async (err, { nomFichier }) => {
        this.#pixFilename = nomFichier;
      });
    });

    const passageOKParser = new saxPath.SaXPath(saxParser, '//PassagesOK/idTechnique');
    passageOKParser.on('match', (xmlNode) => {
      xml2js.parseString(xmlNode, async (err, { idTechnique }) => {
        this.#successfullImports.add(idTechnique);
      });
    });

    const passageKOParser = new saxPath.SaXPath(saxParser, '//passage');
    passageKOParser.on('match', (xmlNode) => {
      xml2js.parseString(xmlNode, async (err, { passage }) => {
        const [errorMessage] = passage['messageErreur'];
        const [certificationId] = passage.idTechnique;

        if (errorMessage.includes('existe déjà en base')) {
          this.#successfullImports.add(certificationId);
        }
        if (errorMessage.includes('Aucun titulaire')) {
          this.#rejectedImports.add(certificationId);
        }
      });
    });

    return new Promise((resolve, reject) => {
      xmlStream.pipe(saxParser).on('error', reject).on('end', resolve);
    });
  }

  #toDomainArray() {
    if (_.isBlank(this.#pixFilename)) {
      throw new Error('Invalid cpf receipt, nomFichier should be an XML node');
    }

    const cpfInfos = [];

    for (const certificationCourseId of this.#rejectedImports) {
      cpfInfos.push(
        this.#toDomain({ certificationCourseId, filename: this.#pixFilename, importStatus: CpfImportStatus.REJECTED }),
      );
    }

    for (const certificationCourseId of this.#successfullImports) {
      cpfInfos.push(
        this.#toDomain({ certificationCourseId, filename: this.#pixFilename, importStatus: CpfImportStatus.SUCCESS }),
      );
    }

    return cpfInfos;
  }

  #toDomain({ certificationCourseId, filename, importStatus }) {
    return new CpfInfos({ certificationCourseId, filename, importStatus });
  }

  async deserialize({ xmlStream }) {
    await this.#parseXml({ xmlStream });
    return this.#toDomainArray();
  }
}
