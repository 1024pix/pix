import { randomUUID } from 'node:crypto';

import xmlbuilder2 from 'xmlbuilder2';
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces.d.ts';

let certificationCourses: Array<{}>;

export async function generateCpfXml({
  sessionId,
  uuid,
  sessionRepository,
  sharedCertificationCourseRepository,
}: {
  sessionId: number;
  uuid?: string;
  sessionRepository: { get: (sessionId: number) => Promise<{ id: number; certificationIds: Array<number | null> }> };
  sharedCertificationCourseRepository: {
    get: ({ id }: { id: number | null }) => Promise<{}>;
  };
}) {
  const { certificationIds } = await sessionRepository.get(sessionId);

  certificationCourses = await Promise.all(
    certificationIds.map(async (id) => await sharedCertificationCourseRepository.get({ id })),
  );

  const internalUuid = uuid || randomUUID();
  return buildFluxCreation(internalUuid).end();
}

function buildFluxCreation(uuid: string): XMLBuilder {
  const root = xmlbuilder2
    .create({ version: '1.0', encoding: 'UTF-8' })
    .ele('cpf:fluxCreation', {
      'xmlns:cpf': 'urn:cdc:cpf:pc5:schema:creation:1.0.0',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    })
    .ele('cpf:idFlux')
    .txt(uuid)
    .up();
  return buildEmetteur(root);
}

function buildEmetteur(node: XMLBuilder): XMLBuilder {
  const emetteurNode = node.ele('cpf:emetteur').ele('cpf:idClient').txt('00XXX000').up();
  return buildCertificateurs(emetteurNode);
}

function buildCertificateurs(node: XMLBuilder): XMLBuilder {
  const certificateurNode = node
    .ele('cpf:certificateurs')
    .ele('cpf:certificateur')
    .ele('cpf:idClient')
    .txt('00XXX000')
    .up()
    .ele('cpf:idContrat')
    .txt('XXXXXX000000')
    .up()
    .ele('cpf:certifications');
  return buildCertifications(certificateurNode);
}

function buildCertifications(node: XMLBuilder): XMLBuilder {
  for (const course of certificationCourses) {
    node
      .ele('cpf:certification')
      .ele('cpf:type')
      .txt('RS')
      .up()
      .ele('cpf:code')
      .txt(getCpfCode(course._createdAt))
      .up()
      .ele('cpf:passageCertifications')
      .ele('cpf:passageCertification')
      .ele('cpf:idTechnique')
      .txt('TITU_COMPLET')
      .up()
      .ele('cpf:urlPreuve')
      .txt('https://www.monurl.fr')
      .up()
      .ele('cpf:complementTitre')
      .txt('complement')
      .up()
      .ele('cpf:libelleOption')
      .txt('option')
      .up()
      .ele('cpf:obtentionCertification')
      .txt('PAR_SCORING')
      .up()
      .ele('cpf:scoring')
      .txt('10')
      .up()
      .ele('cpf:dateDebutExamen')
      .txt('2026-05-30')
      .up()
      .ele('cpf:dateFinExamen')
      .txt('2026-06-01')
      .up()
      .ele('cpf:modalitePassageExamen')
      .txt('MIXTE')
      .up()
      .ele('cpf:codePostalCentreExamen')
      .txt('01000')
      .up()
      .ele('cpf:dateDebutValidite')
      .txt('2026-06-10')
      .up()
      .ele('cpf:dateFinValidite')
      .txt('2086-06-10')
      .up()
      .ele('cpf:mentionValidee')
      .txt('MENTION_BIEN')
      .up()
      .ele('cpf:numeriqueLangue')
      .ele('cpf:niveauLangueEuropeen')
      .txt('B2')
      .up()
      .ele('cpf:niveauNumeriqueEuropeen')
      .ele('cpf:scoreGeneral')
      .txt('999')
      .up()
      .ele('cpf:resultats')
      .ele('cpf:resultat')
      .ele('cpf:niveau')
      .txt('8')
      .up()
      .ele('cpf:domaineCompetenceId')
      .txt('2')
      .up()
      .ele('cpf:competenceId')
      .txt('6')
      .up()
      .up()
      .up()
      .up()
      .up()
      .ele('cpf:modalitesInscription')
      .ele('cpf:modaliteAcces')
      .txt('FORMATION_INITIALE_APPRENTISSAGE')
      .up()
      .ele('cpf:initiativeInscription')
      .txt('AUTRE')
      .up()
      .ele('cpf:dateInscription')
      .txt('2026-04-02')
      .up()
      .up()
      .ele('cpf:identificationTitulaire')
      .ele('cpf:titulaire')
      .ele('cpf:nomNaissance')
      .txt(course._lastName)
      .up()
      .ele('cpf:nomUsage')
      .txt(course._lastName)
      .up()
      .ele('cpf:prenom1')
      .txt(course._firstName)
      .up()
      .ele('cpf:prenom2')
      .txt('PRENOM-DEUX')
      .up()
      .ele('cpf:prenom3')
      .txt('PRENOM-TROIS')
      .up()
      .ele('cpf:anneeNaissance')
      .txt(String(new Date(course._birthdate).getFullYear()))
      .up()
      .ele('cpf:moisNaissance')
      .txt(String(new Date(course._birthdate).getMonth() + 1))
      .up()
      .ele('cpf:jourNaissance')
      .txt(String(new Date(course._birthdate).getDate()))
      .up()
      .ele('cpf:codeCommuneNaissance')
      .ele('cpf:codeInseeNaissance')
      .ele('cpf:codeInsee')
      .txt(course._birthINSEECode)
      .up()
      .up()
      .up()
      .ele('cpf:libelleCommuneNaissance')
      .txt(course._birthplace)
      .up()
      .up()
      .up()
      .up();
  }

  return node;
}

function getCpfCode(createdAt: Date): string {
  if (createdAt < new Date('2021-12-31')) {
    return 'RS3807';
  }
  if (createdAt < new Date('2024-12-11')) {
    return 'RS5875';
  }
  return 'RS6894';
}
