const { cpf } = require('../../config');
const { createCB } = require('xmlbuilder2');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const bluebird = require('bluebird');

const schemaVersion = '1.0.0';

// prettier-ignore
function buildXmlExport({ cpfCertificationResults, writableStream, opts = {} }) {
  const xmlBuilder = createCB({
    data: (text) => writableStream.write(text),
    end: () => writableStream.end(),
    error: (error) => {
      throw new Error(error);
    },
    allowEmptyTags: true,
    ...opts,
  });

  xmlBuilder
    .dec()
    .ele('cpf:flux', {
      'xmlns:cpf': `urn:cdc:cpf:pc5:schema:${schemaVersion}`,
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    })
      .ele('cpf:idFlux').txt(uuidv4()).up()
      .ele('cpf:horodatage').txt(moment().format('YYYY-MM-DDThh:mm:ssZ')).up()
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
                .ele('cpf:passageCertifications');

  bluebird
    .each(
      cpfCertificationResults,
      async function ({
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
      }) {
        const [yearOfBirth, monthOfBirth, dayOfBirth] = birthdate.split('-');
        xmlBuilder
          .ele('cpf:passageCertification')
            .ele('cpf:idTechnique').txt(id).up()
            .ele('cpf:obtentionCertification').txt('PAR_SCORING').up()
            .ele('cpf:donneeCertifiee').txt(true).up()
            .ele('cpf:dateDebutValidite').txt(moment(publishedAt).format('YYYY-MM-DD')).up()
            .ele('cpf:dateFinValidite', { 'xsi:nil': true }).up()
            .ele('cpf:presenceNiveauLangueEuro').txt(false).up()
            .ele('cpf:presenceNiveauNumeriqueEuro').txt(true).up()
            .ele('cpf:niveauNumeriqueEuropeen')
              .ele('cpf:scoreGeneral').txt(pixScore).up()
              .ele('cpf:resultats');

        europeanNumericLevels.forEach(({ domainCompetenceId, competenceId, level }) => {
          xmlBuilder
            .ele('cpf:resultat')
              .ele('cpf:niveau').txt(level).up()
              .ele('cpf:domaineCompetenceId').txt(domainCompetenceId).up()
              .ele('cpf:competenceId').txt(competenceId).up()
            .up();
        });

        xmlBuilder.up().up();
        xmlBuilder
          .ele('cpf:scoring').txt(pixScore).up()
          .ele('cpf:mentionValidee', { 'xsi:nil': true }).up()
          .ele('cpf:modalitesInscription')
            .ele('cpf:modaliteAcces', { 'xsi:nil': true }).up()
          .up()
          .ele('cpf:identificationTitulaire')
            .ele('cpf:titulaire')
              .ele('cpf:nomNaissance').txt(lastName).up()
              .ele('cpf:nomUsage', { 'xsi:nil': true }).up()
              .ele('cpf:prenom1').txt(firstName).up()
              .ele('cpf:anneeNaissance').txt(yearOfBirth).up()
              .ele('cpf:moisNaissance').txt(monthOfBirth).up()
              .ele('cpf:jourNaissance').txt(dayOfBirth).up()
              .ele('cpf:sexe').txt(sex).up()
              .ele('cpf:codeCommuneNaissance')

        if (inseeCode) {
          xmlBuilder.ele('cpf:codeInseeNaissance')
                      .ele('cpf:codeInsee').txt(inseeCode).up()
                    .up();
        } else if (postalCode) {
          xmlBuilder.ele('cpf:codePostalNaissance')
                      .ele('cpf:codePostal').txt(postalCode).up()
                    .up();
        } else {
          xmlBuilder.ele('cpf:codePostalNaissance')
                      .ele('cpf:codePostal', { 'xsi:nil': true }).up()
                    .up();
        }
        xmlBuilder.up()
          .ele('cpf:libelleCommuneNaissance').txt(birthplace).up();
        if (countryCode) {
          xmlBuilder.ele('cpf:codePaysNaissance').txt(countryCode).up();
        }
        xmlBuilder.ele('cpf:libellePaysNaissance').txt(birthCountry).up();

        xmlBuilder.up().up().up();
      }
    )
    .then(() => {
      xmlBuilder.up().up().up().up();
      xmlBuilder.end();
    });
}

module.exports = {
  buildXmlExport,
};
