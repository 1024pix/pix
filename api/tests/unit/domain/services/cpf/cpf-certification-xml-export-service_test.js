import { domainBuilder, expect, sinon, streamToPromise } from '../../../../test-helper.js';
import stream from 'stream';
// eslint-disable-next-line n/no-unpublished-import
import { parseXml } from 'libxmljs2';
import { readFile } from 'fs/promises';
import * as url from 'url';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import * as cpfCertificationXmlExportService from '../../../../../lib/domain/services/cpf-certification-xml-export-service.js';

const { PassThrough } = stream;

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

dayjs.extend(utc);
dayjs.extend(timezone);

describe('Unit | Services | cpf-certification-xml-export-service', function () {
  let clock;
  let uuidService;

  beforeEach(function () {
    const now = dayjs('2022-02-01T10:43:27Z').tz('Europe/Paris').toDate();
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    uuidService = { randomUUID: sinon.stub() };
  });

  afterEach(function () {
    clock.restore();
  });

  describe('getXmlExport', function () {
    it('should return a writable stream with cpf certification results', async function () {
      // given

      uuidService.randomUUID.returns('5d079a5d-0a4d-45ac-854d-256b01cacdfe');

      const firstCpfCertificationResult = domainBuilder.buildCpfCertificationResult({
        id: 1234,
        firstName: 'Bart',
        lastName: 'Haba',
        birthdate: '1993-05-23',
        sex: 'M',
        birthINSEECode: null,
        birthPostalCode: '75002',
        birthplace: 'PARIS',
        birthCountry: 'FRANCE',
        publishedAt: '2022-01-03',
        pixScore: 324,
        competenceMarks: [
          { competenceCode: '2.1', level: 4 },
          { competenceCode: '3.2', level: 3 },
        ],
      });

      const secondCpfCertificationResult = domainBuilder.buildCpfCertificationResult({
        id: 4567,
        firstName: 'Eva',
        lastName: 'Porée',
        birthdate: '1992-11-03',
        sex: 'F',
        birthINSEECode: '99109',
        birthPostalCode: null,
        birthplace: 'BERLIN',
        birthCountry: 'ALLEMAGNE',
        publishedAt: '2022-01-07',
        pixScore: 512,
        competenceMarks: [
          { competenceCode: '1.1', level: 1 },
          { competenceCode: '4.2', level: 2 },
        ],
      });
      const writableStream = new PassThrough();

      // when
      cpfCertificationXmlExportService.buildXmlExport({
        cpfCertificationResults: [firstCpfCertificationResult, secondCpfCertificationResult],
        writableStream,
        uuidService,
      });

      //then
      const expectedXmlExport = _getExpectedXmlExport();
      const xmlExport = await streamToPromise(writableStream);
      expect(xmlExport).to.equal(expectedXmlExport.replace(/\n| {2}/g, ''));
    });

    describe('CPF XSD validation', function () {
      let cpfXsd;

      before(async function () {
        cpfXsd = await readFile(`${__dirname}/cpf.xsd`, 'utf8');
      });

      it('it should validate our generated XML', async function () {
        // given
        uuidService.randomUUID.returns('5d079a5d-0a4d-45ac-854d-256b01cacdfe');

        const cpfCertificationResult = _buildCpfCertificationResult();

        const writableStream = new PassThrough();

        // when
        cpfCertificationXmlExportService.buildXmlExport({
          cpfCertificationResults: [cpfCertificationResult],
          writableStream,
          uuidService,
        });

        const parsedXmlToExport = await _parseAndValidateXmlWithXsd({ writableStream, cpfXsd });

        // then
        expect(parsedXmlToExport.validationErrors).to.be.empty;
      });

      it('it should detect CPF schema errors', async function () {
        // given
        uuidService.randomUUID.returns('5d079a5d-0a4d-45ac-854d-256b01cacdfe');

        const incorrectCpfCertificationResult = _buildCpfCertificationResult({ sex: null });

        const writableStream = new PassThrough();

        // when
        cpfCertificationXmlExportService.buildXmlExport({
          cpfCertificationResults: [incorrectCpfCertificationResult],
          writableStream,
          uuidService,
        });

        const parsedXmlToExport = await _parseAndValidateXmlWithXsd({ writableStream, cpfXsd });

        // then
        expect(parsedXmlToExport.validationErrors[0].message).to.equal(
          "Element '{urn:cdc:cpf:pc5:schema:1.0.0}sexe': [facet 'enumeration'] The value '' is not an element of the set {'M', 'F'}.\n",
        );
      });

      context('when optional property has empty value', function () {
        context('when there is no birthplace for the candidate', function () {
          it('it should generate a valid XML', async function () {
            // given
            uuidService.randomUUID.returns('5d079a5d-0a4d-45ac-854d-256b01cacdfe');

            const cpfCertificationResult = _buildCpfCertificationResult({ birthplace: null });

            const writableStream = new PassThrough();

            // when
            cpfCertificationXmlExportService.buildXmlExport({
              cpfCertificationResults: [cpfCertificationResult],
              writableStream,
              uuidService,
            });

            const parsedXmlToExport = await _parseAndValidateXmlWithXsd({ writableStream, cpfXsd });

            // then
            expect(parsedXmlToExport.validationErrors).to.be.empty;
          });
        });

        context('when there is no birthCountry for the candidate', function () {
          it('it should generate a valid XML', async function () {
            // given
            uuidService.randomUUID.returns('5d079a5d-0a4d-45ac-854d-256b01cacdfe');

            const cpfCertificationResult = _buildCpfCertificationResult({ birthCountry: null });

            const writableStream = new PassThrough();

            // when
            cpfCertificationXmlExportService.buildXmlExport({
              cpfCertificationResults: [cpfCertificationResult],
              writableStream,
              uuidService,
            });

            const parsedXmlToExport = await _parseAndValidateXmlWithXsd({ writableStream, cpfXsd });

            // then
            expect(parsedXmlToExport.validationErrors).to.be.empty;
          });
        });
        // eslint-disable-next-line mocha/no-setup-in-describe
        [
          { emptyKey: 'birthCountry', xmlNode: 'libellePaysNaissance' },
          {
            emptyKey: 'birthplace',
            xmlNode: 'libelleCommuneNaissance',
          },
          {
            emptyKey: 'birthINSEECode',
            xmlNode: 'codeInseeNaissance',
          },
          {
            emptyKey: 'countryCode',
            xmlNode: 'codePaysNaissance',
          },
        ].forEach(({ emptyKey, xmlNode }) => {
          context(`when ${emptyKey} is empty`, function () {
            it(`it should not add a cpf:${xmlNode} node`, async function () {
              // given
              uuidService.randomUUID.returns('5d079a5d-0a4d-45ac-854d-256b01cacdfe');

              const cpfCertificationResult = _buildCpfCertificationResult({ [emptyKey]: null });
              const writableStream = new PassThrough();

              // when
              cpfCertificationXmlExportService.buildXmlExport({
                cpfCertificationResults: [cpfCertificationResult],
                writableStream,
                uuidService,
              });

              const xmlExport = await streamToPromise(writableStream);
              const parsedXmlToExport = parseXml(xmlExport);

              // then
              expect(parsedXmlToExport.get(`//cpf:${xmlNode}`, { cpf: 'urn:cdc:cpf:pc5:schema:1.0.0' })).to.be
                .undefined;
            });
          });
        });
      });

      context('when there is an birthINSEECode for the candidate', function () {
        it(`it should not add codePostalNaissance node`, async function () {
          // given
          uuidService.randomUUID.returns('5d079a5d-0a4d-45ac-854d-256b01cacdfe');

          const cpfCertificationResult = _buildCpfCertificationResult({ birthINSEECode: '75115' });

          const writableStream = new PassThrough();

          // when
          cpfCertificationXmlExportService.buildXmlExport({
            cpfCertificationResults: [cpfCertificationResult],
            writableStream,
            uuidService,
          });

          const xmlExport = await streamToPromise(writableStream);
          const parsedXmlToExport = parseXml(xmlExport);

          // then
          expect(
            parsedXmlToExport.get(`//cpf:codeInseeNaissance`, { cpf: 'urn:cdc:cpf:pc5:schema:1.0.0' }).child(0).text(),
          ).to.be.equal('75115');
          expect(parsedXmlToExport.get(`//cpf:codePostalNaissance`, { cpf: 'urn:cdc:cpf:pc5:schema:1.0.0' })).to.be
            .undefined;
        });
      });

      context('when there is an birthPostalCode and no birthINSEECode for the candidate', function () {
        it(`it should not add codeInseeNaissance node`, async function () {
          // given
          uuidService.randomUUID.returns('5d079a5d-0a4d-45ac-854d-256b01cacdfe');

          const cpfCertificationResult = _buildCpfCertificationResult({
            birthINSEECode: null,
            birthPostalCode: '75002',
          });

          const writableStream = new PassThrough();

          // when
          cpfCertificationXmlExportService.buildXmlExport({
            cpfCertificationResults: [cpfCertificationResult],
            writableStream,
            uuidService,
          });

          const xmlExport = await streamToPromise(writableStream);
          const parsedXmlToExport = parseXml(xmlExport);

          // then
          expect(
            parsedXmlToExport.get(`//cpf:codePostalNaissance`, { cpf: 'urn:cdc:cpf:pc5:schema:1.0.0' }).child(0).text(),
          ).to.be.equal('75002');
          expect(parsedXmlToExport.get(`//cpf:codeInseeNaissance`, { cpf: 'urn:cdc:cpf:pc5:schema:1.0.0' })).to.be
            .undefined;
        });
      });

      context('when there is no birthPostalCode and no birthINSEECode for the candidate', function () {
        it(`it should not add codeInseeNaissance and add an empty codePostal node`, async function () {
          // given
          uuidService.randomUUID.returns('5d079a5d-0a4d-45ac-854d-256b01cacdfe');

          const cpfCertificationResult = _buildCpfCertificationResult({
            birthINSEECode: null,
            birthPostalCode: null,
          });

          const writableStream = new PassThrough();

          // when
          cpfCertificationXmlExportService.buildXmlExport({
            cpfCertificationResults: [cpfCertificationResult],
            writableStream,
            uuidService,
          });

          const xmlExport = await streamToPromise(writableStream);
          const parsedXmlToExport = parseXml(xmlExport);

          // then
          expect(
            parsedXmlToExport.get(`//cpf:codePostalNaissance`, { cpf: 'urn:cdc:cpf:pc5:schema:1.0.0' }).child(0).text(),
          ).to.be.equal('');
          expect(parsedXmlToExport.get(`//cpf:codeInseeNaissance`, { cpf: 'urn:cdc:cpf:pc5:schema:1.0.0' })).to.be
            .undefined;
        });
      });
    });
  });
});

function _getExpectedXmlExport() {
  return `<?xml version="1.0"?>
<cpf:flux xmlns:cpf="urn:cdc:cpf:pc5:schema:1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <cpf:idFlux>
    5d079a5d-0a4d-45ac-854d-256b01cacdfe
  </cpf:idFlux>
  <cpf:horodatage>
    2022-02-01T11:43:27+01:00
  </cpf:horodatage>
  <cpf:emetteur>
    <cpf:idClient>
      03VML243
    </cpf:idClient>
    <cpf:certificateurs>
      <cpf:certificateur>
        <cpf:idClient>
          03VML243
        </cpf:idClient>
        <cpf:idContrat>
          MCFCER000209
        </cpf:idContrat>
        <cpf:certifications>
          <cpf:certification>
            <cpf:type>
              RS
            </cpf:type>
            <cpf:code>
              RS5875
            </cpf:code>
            <cpf:natureDeposant>
              CERTIFICATEUR
            </cpf:natureDeposant>
            <cpf:passageCertifications>
              <cpf:passageCertification>
                <cpf:idTechnique>
                  1234
                </cpf:idTechnique>
                <cpf:obtentionCertification>
                  PAR_SCORING
                </cpf:obtentionCertification>
                <cpf:donneeCertifiee>
                  true
                </cpf:donneeCertifiee>
                <cpf:dateDebutValidite>
                  2022-01-03
                </cpf:dateDebutValidite>
                <cpf:dateFinValidite xsi:nil="true"></cpf:dateFinValidite>
                <cpf:presenceNiveauLangueEuro>
                  false
                </cpf:presenceNiveauLangueEuro>
                <cpf:presenceNiveauNumeriqueEuro>
                  true
                </cpf:presenceNiveauNumeriqueEuro>
                <cpf:niveauNumeriqueEuropeen>
                  <cpf:scoreGeneral>
                    324
                  </cpf:scoreGeneral>
                  <cpf:resultats>
                    <cpf:resultat>
                      <cpf:niveau>
                        4
                      </cpf:niveau>
                      <cpf:domaineCompetenceId>
                        2
                      </cpf:domaineCompetenceId>
                      <cpf:competenceId>
                        1
                      </cpf:competenceId>
                    </cpf:resultat>
                    <cpf:resultat>
                      <cpf:niveau>
                        4
                      </cpf:niveau>
                      <cpf:domaineCompetenceId>
                        2
                      </cpf:domaineCompetenceId>
                      <cpf:competenceId>
                        5
                      </cpf:competenceId>
                    </cpf:resultat>
                  </cpf:resultats>
                </cpf:niveauNumeriqueEuropeen>
                <cpf:scoring>
                  324
                </cpf:scoring>
                <cpf:mentionValidee xsi:nil="true"></cpf:mentionValidee>
                <cpf:modalitesInscription>
                  <cpf:modaliteAcces xsi:nil="true"></cpf:modaliteAcces>
                </cpf:modalitesInscription>
                <cpf:identificationTitulaire>
                  <cpf:titulaire>
                    <cpf:nomNaissance>
                      Haba
                    </cpf:nomNaissance>
                    <cpf:nomUsage xsi:nil="true"></cpf:nomUsage>
                    <cpf:prenom1>
                      Bart
                    </cpf:prenom1>
                    <cpf:anneeNaissance>
                      1993
                    </cpf:anneeNaissance>
                    <cpf:moisNaissance>
                      05
                    </cpf:moisNaissance>
                    <cpf:jourNaissance>
                      23
                    </cpf:jourNaissance>
                    <cpf:sexe>
                      M
                    </cpf:sexe>
                    <cpf:codeCommuneNaissance>
                      <cpf:codePostalNaissance>
                        <cpf:codePostal>
                          75002
                        </cpf:codePostal>
                      </cpf:codePostalNaissance>
                    </cpf:codeCommuneNaissance>
                    <cpf:libelleCommuneNaissance>
                      PARIS
                    </cpf:libelleCommuneNaissance>
                    <cpf:libellePaysNaissance>
                      FRANCE
                    </cpf:libellePaysNaissance>
                  </cpf:titulaire>
                </cpf:identificationTitulaire>
              </cpf:passageCertification>
              <cpf:passageCertification>
                <cpf:idTechnique>
                  4567
                </cpf:idTechnique>
                <cpf:obtentionCertification>
                  PAR_SCORING
                </cpf:obtentionCertification>
                <cpf:donneeCertifiee>
                  true
                </cpf:donneeCertifiee>
                <cpf:dateDebutValidite>
                  2022-01-07
                </cpf:dateDebutValidite>
                <cpf:dateFinValidite xsi:nil="true"></cpf:dateFinValidite>
                <cpf:presenceNiveauLangueEuro>
                  false
                </cpf:presenceNiveauLangueEuro>
                <cpf:presenceNiveauNumeriqueEuro>
                  true
                </cpf:presenceNiveauNumeriqueEuro>
                <cpf:niveauNumeriqueEuropeen>
                  <cpf:scoreGeneral>
                    512
                  </cpf:scoreGeneral>
                  <cpf:resultats>
                    <cpf:resultat>
                      <cpf:niveau>
                        1
                      </cpf:niveau>
                      <cpf:domaineCompetenceId>
                        1
                      </cpf:domaineCompetenceId>
                      <cpf:competenceId>
                        1
                      </cpf:competenceId>
                    </cpf:resultat>
                    <cpf:resultat>
                      <cpf:niveau>
                        1
                      </cpf:niveau>
                      <cpf:domaineCompetenceId>
                        1
                      </cpf:domaineCompetenceId>
                      <cpf:competenceId>
                        2
                      </cpf:competenceId>
                    </cpf:resultat>
                    <cpf:resultat>
                      <cpf:niveau>
                        2
                      </cpf:niveau>
                      <cpf:domaineCompetenceId>
                        4
                      </cpf:domaineCompetenceId>
                      <cpf:competenceId>
                        2
                      </cpf:competenceId>
                    </cpf:resultat>
                  </cpf:resultats>
                </cpf:niveauNumeriqueEuropeen>
                <cpf:scoring>
                  512
                </cpf:scoring>
                <cpf:mentionValidee xsi:nil="true"></cpf:mentionValidee>
                <cpf:modalitesInscription>
                  <cpf:modaliteAcces xsi:nil="true"></cpf:modaliteAcces>
                </cpf:modalitesInscription>
                <cpf:identificationTitulaire>
                  <cpf:titulaire>
                    <cpf:nomNaissance>
                      Porée
                    </cpf:nomNaissance>
                    <cpf:nomUsage xsi:nil="true"></cpf:nomUsage>
                    <cpf:prenom1>
                      Eva
                    </cpf:prenom1>
                    <cpf:anneeNaissance>
                      1992
                    </cpf:anneeNaissance>
                    <cpf:moisNaissance>
                      11
                    </cpf:moisNaissance>
                    <cpf:jourNaissance>
                      03
                    </cpf:jourNaissance>
                    <cpf:sexe>
                      F
                    </cpf:sexe>
                    <cpf:codeCommuneNaissance>
                      <cpf:codeInseeNaissance>
                        <cpf:codeInsee>
                          99109
                        </cpf:codeInsee>
                      </cpf:codeInseeNaissance>
                    </cpf:codeCommuneNaissance>
                    <cpf:libelleCommuneNaissance>
                      BERLIN
                    </cpf:libelleCommuneNaissance>
                    <cpf:codePaysNaissance>
                      109
                    </cpf:codePaysNaissance>
                    <cpf:libellePaysNaissance>
                      ALLEMAGNE
                    </cpf:libellePaysNaissance>
                  </cpf:titulaire>
                </cpf:identificationTitulaire>
              </cpf:passageCertification>
            </cpf:passageCertifications>
          </cpf:certification>
        </cpf:certifications>
      </cpf:certificateur>
    </cpf:certificateurs>
  </cpf:emetteur>
</cpf:flux>`;
}

async function _parseAndValidateXmlWithXsd({ writableStream, cpfXsd }) {
  const xmlExport = await streamToPromise(writableStream);

  const parsedXsd = parseXml(cpfXsd);
  const parsedXmlToExport = parseXml(xmlExport);
  parsedXmlToExport.validate(parsedXsd);

  return parsedXmlToExport;
}

function _buildCpfCertificationResult(props) {
  return domainBuilder.buildCpfCertificationResult({
    id: 1234,
    firstName: 'Bart',
    lastName: 'Haba',
    birthdate: '1993-05-23',
    sex: 'M',
    birthINSEECode: '75115',
    birthPostalCode: null,
    birthplace: null,
    birthCountry: 'France',
    publishedAt: '2022-01-03',
    pixScore: 324,
    competenceMarks: [
      { competenceCode: '2.1', level: 4 },
      { competenceCode: '3.2', level: 3 },
    ],
    ...props,
  });
}
