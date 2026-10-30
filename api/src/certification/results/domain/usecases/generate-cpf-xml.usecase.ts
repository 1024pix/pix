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

  const root = {
    'cpf:fluxCreation': {
      '@xmlns:cpf': 'urn:cdc:cpf:pc5:schema:creation:1.0.0',
      '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'cpf:idFlux': uuid,
      'cpf:emetteur': {
        'cpf:idClient': '00XXX000',
        'cpf:certificateurs': [
          {
            'cpf:certificateur': {
              'cpf:idClient': '00XXX000',
              'cpf:idContrat': 'XXXXXX000000',
              'cpf:certifications': [
                {
                  'cpf:certification': {
                    'cpf:type': 'RS',
                    'cpf:code': getCpfCode(certificationCourses[0]._createdAt),
                    'cpf:passageCertifications': {
                      'cpf:passageCertification': buildPassageCertifications(certificationCourses),
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  };

  return xmlbuilder2.create({ version: '1.0', encoding: 'UTF-8' }, root).end();
}

function buildPassageCertifications(certificationCourses: {}[]) {
  return certificationCourses.map(function (course) {
    return {
      'cpf:idTechnique': 'TITU_COMPLET',
      'cpf:urlPreuve': 'https://www.monurl.fr',
      'cpf:complementTitre': 'complement',
      'cpf:libelleOption': 'option',
      'cpf:obtentionCertification': 'PAR_SCORING',
      'cpf:scoring': '10',
      'cpf:dateDebutExamen': course._createdAt.toLocaleDateString('en-CA'),
      'cpf:dateFinExamen': course._createdAt.toLocaleDateString('en-CA'),
      'cpf:modalitePassageExamen': 'MIXTE',
      'cpf:codePostalCentreExamen': '01000',
      'cpf:dateDebutValidite': course._createdAt.toLocaleDateString('en-CA'),
      'cpf:numeriqueLangue': {
        'cpf:niveauLangueEuropeen': 'B2',
        'cpf:niveauNumeriqueEuropeen': {
          'cpf:scoreGeneral': '999',
          'cpf:resultats': [
            {
              'cpf:resultat': {
                'cpf:niveau': '8',
                'cpf:domaineCompetenceId': '2',
                'cpf:competenceId': '6',
              },
            },
          ],
        },
      },
      'cpf:modalitesInscription': {
        'cpf:modaliteAcces': 'FORMATION_INITIALE_APPRENTISSAGE',
        'cpf:initiativeInscription': 'AUTRE',
        'cpf:dateInscription': '2026-04-02',
      },
      'cpf:identificationTitulaire': {
        'cpf:titulaire': {
          'cpf:nomNaissance': course._lastName,
          'cpf:nomUsage': course._lastName,
          'cpf:prenom1': course._firstName,
          'cpf:prenom2': 'PRENOM-DEUX',
          'cpf:prenom3': 'PRENOM-TROIS',
          'cpf:anneeNaissance': String(new Date(course._birthdate).getFullYear()),
          'cpf:moisNaissance': String(new Date(course._birthdate).getMonth() + 1),
          'cpf:jourNaissance': String(new Date(course._birthdate).getDate()),
          'cpf:codeCommuneNaissance': {
            'cpf:codeInseeNaissance': {
              'cpf:codeInsee': course._birthINSEECode,
            },
          },
          'cpf:libelleCommuneNaissance': course._birthplace,
        },
      },
    };
  });
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
