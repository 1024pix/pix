const { cpf } = require('../../config.js');
const { create, fragment } = require('xmlbuilder2');
const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/customParseFormat'));
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const schemaVersion = '1.0.0';

// prettier-ignore
async function buildXmlExport({ cpfCertificationResults, writableStream, opts = {} }) {
  const overrideOpts = { allowEmptyTags: true, };
  const PLACEHOLDER = 'PLACEHOLDER';
  const formatedDate = dayjs().tz('Europe/Paris').format('YYYY-MM-DDThh:mm:ss') + '+01:00';
  const root = create()
    .ele('cpf:flux', {
      'xmlns:cpf': `urn:cdc:cpf:pc5:schema:${schemaVersion}`,
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    })
    .ele('cpf:idFlux').txt(uuidv4()).up()
    .ele('cpf:horodatage').txt(formatedDate).up()
    .ele('cpf:emetteur')
    .ele('cpf:idClient').txt(cpf.idClient).up()
    .ele('cpf:certificateurs')
    .ele('cpf:certificateur')
    .ele('cpf:idClient').txt(cpf.idClient).up()
    .ele('cpf:idContrat').txt(cpf.idContrat).up()
    .ele('cpf:certifications')
    .ele('cpf:certification')
    .ele('cpf:type').txt('RS').up()
    .ele('cpf:code').txt(cpf.codeFranceConnect).up()
    .ele('cpf:natureDeposant').txt('CERTIFICATEUR').up()
    .ele('cpf:passageCertifications').txt(PLACEHOLDER);
  const [headerOpeningTag, headerClosingTag] = root.end({ ...opts, ...overrideOpts }).split(PLACEHOLDER);

  await _write(writableStream, headerOpeningTag);

  for (const {
    id,
    publishedAt,
    pixScore,
    firstName,
    lastName,
    birthdate,
    sex,
    inseeCode,
    postalCode,
    birthplace,
    countryCode,
    birthCountry,
    europeanNumericLevels,
  } of cpfCertificationResults) {
    const [yearOfBirth, monthOfBirth, dayOfBirth] = birthdate.split('-');
    const line = fragment()
      .ele('cpf:passageCertification')
      .ele('cpf:idTechnique').txt(id)
      .up()
      .ele('cpf:obtentionCertification').txt('PAR_SCORING')
      .up()
      .ele('cpf:donneeCertifiee').txt(true)
      .up()
      .ele('cpf:dateDebutValidite').txt(dayjs(publishedAt).format('YYYY-MM-DD'))
      .up()
      .ele('cpf:dateFinValidite', { 'xsi:nil': true })
      .up()
      .ele('cpf:presenceNiveauLangueEuro').txt(false)
      .up()
      .ele('cpf:presenceNiveauNumeriqueEuro').txt(true)
      .up();
    const niveauNumeriqueEuropeen = line
      .ele('cpf:niveauNumeriqueEuropeen')
      .ele('cpf:scoreGeneral').txt(pixScore)
      .up();
    const resultats = niveauNumeriqueEuropeen
      .ele('cpf:resultats');

    europeanNumericLevels.forEach(({ domainCompetenceId, competenceId, level }) => {
      resultats
        .ele('cpf:resultat')
        .ele('cpf:niveau').txt(level)
        .up()
        .ele('cpf:domaineCompetenceId').txt(domainCompetenceId)
        .up()
        .ele('cpf:competenceId').txt(competenceId)
        .up()
        .up();
    });

    resultats
      .up();
    niveauNumeriqueEuropeen
      .up();

    const details = line
      .ele('cpf:scoring').txt(pixScore)
      .up()
      .ele('cpf:mentionValidee', { 'xsi:nil': true })
      .up()
      .ele('cpf:modalitesInscription')
      .ele('cpf:modaliteAcces', { 'xsi:nil': true })
      .up()
      .up()
      .ele('cpf:identificationTitulaire')
      .ele('cpf:titulaire')
      .ele('cpf:nomNaissance').txt(lastName)
      .up()
      .ele('cpf:nomUsage', { 'xsi:nil': true })
      .up()
      .ele('cpf:prenom1').txt(firstName)
      .up()
      .ele('cpf:anneeNaissance').txt(yearOfBirth)
      .up()
      .ele('cpf:moisNaissance').txt(monthOfBirth)
      .up()
      .ele('cpf:jourNaissance').txt(dayOfBirth)
      .up()
      .ele('cpf:sexe').txt(sex)
      .up()

    const communeNaissance = details
      .ele('cpf:codeCommuneNaissance');

    if (inseeCode) {
      communeNaissance
        .ele('cpf:codeInseeNaissance')
        .ele('cpf:codeInsee').txt(inseeCode)
        .up()
        .up();
    } else if (postalCode) {
      communeNaissance
        .ele('cpf:codePostalNaissance')
        .ele('cpf:codePostal').txt(postalCode)
        .up()
        .up();
    } else {
      communeNaissance
        .ele('cpf:codePostalNaissance')
        .ele('cpf:codePostal', { 'xsi:nil': true })
        .up()
        .up();
    }
    communeNaissance
      .up()

    details
      .ele('cpf:libelleCommuneNaissance').txt(birthplace)
      .up()
      .up()
    if (countryCode) {
      details
        .ele('cpf:codePaysNaissance').txt(countryCode)
        .up();
    }
    details
      .ele('cpf:libellePaysNaissance').txt(birthCountry)
      .up();

    line
      .up();
    await _write(writableStream, line.end({ ...opts, ...overrideOpts, }));
  }

  await _write(writableStream, headerClosingTag);
  writableStream.end();
}

module.exports = {
  buildXmlExport,
};

function _write(writableStream, data) {
  return new Promise((resolve) => {
    const needDrain = !writableStream.write(data);
    if (needDrain) {
      writableStream.once('drain', resolve);
    } else {
      resolve();
    }
  });
}
