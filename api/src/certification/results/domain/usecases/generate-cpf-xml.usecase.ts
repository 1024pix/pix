import { randomUUID } from 'node:crypto';

import xmlbuilder2 from 'xmlbuilder2';

import { NotFoundError } from '../../../../shared/domain/errors.js';

export async function generateCpfXml({
  sessionId,
  uuid,
  certificationResultRepository,
}: {
  sessionId: number;
  uuid?: string;
  certificationResultRepository: {
    findCertificatesBySessionId: ({ sessionId }: { sessionId: number }) => Promise<
      [
        {
          deliveredAt: Date;
          lastName: string;
          firstName: string;
          birthdate: Date;
          birthINSEECode: string;
          birthplace: string;
          birthCountryCode: string;
          birthCountryPlace: string;
        },
      ]
    >;
  };
}) {
  const certifications = await certificationResultRepository.findCertificatesBySessionId({ sessionId });

  if (certifications.length <= 0) {
    throw new NotFoundError('aucun certificats trouvé pour cette session');
  }

  const internalUuid = uuid || randomUUID();

  const root = {
    'cpf:fluxCreation': {
      '@xmlns:cpf': 'urn:cdc:cpf:pc5:schema:creation:1.0.0',
      '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'cpf:idFlux': internalUuid,
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
                    'cpf:code': getCpfCode(certifications[0].deliveredAt),
                    'cpf:passageCertifications': {
                      'cpf:passageCertification': buildPassageCertifications(certifications),
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

function buildPassageCertifications(
  certifications: {
    deliveredAt: Date;
    lastName: string;
    firstName: string;
    birthdate: Date;
    birthINSEECode: string;
    birthplace: string;
    birthCountryCode: string;
    birthCountryPlace: string;
  }[],
) {
  return certifications.map(function (certification) {
    return {
      'cpf:idTechnique': 'TITU_COMPLET',
      'cpf:urlPreuve': 'https://www.monurl.fr',
      'cpf:complementTitre': 'complement',
      'cpf:libelleOption': 'option',
      'cpf:obtentionCertification': 'PAR_SCORING',
      'cpf:scoring': '10',
      'cpf:dateDebutExamen': certification.deliveredAt.toLocaleDateString('en-CA'),
      'cpf:dateFinExamen': certification.deliveredAt.toLocaleDateString('en-CA'),
      'cpf:modalitePassageExamen': 'MIXTE',
      'cpf:codePostalCentreExamen': '01000',
      'cpf:dateDebutValidite': certification.deliveredAt.toLocaleDateString('en-CA'),
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
          'cpf:nomNaissance': certification.lastName,
          'cpf:nomUsage': certification.lastName,
          'cpf:prenom1': certification.firstName,
          'cpf:prenom2': 'PRENOM-DEUX',
          'cpf:prenom3': 'PRENOM-TROIS',
          'cpf:anneeNaissance': String(new Date(certification.birthdate).getFullYear()),
          'cpf:moisNaissance': String(new Date(certification.birthdate).getMonth() + 1),
          'cpf:jourNaissance': String(new Date(certification.birthdate).getDate()),
          'cpf:codeCommuneNaissance': {
            'cpf:codeInseeNaissance': { 'cpf:codeInsee': certification.birthINSEECode },
            // ou
            // 'cpf:codeInseeNaissance': { 'cpf:codePostal': certification.birthPostalCode, },
          },
          'cpf:libelleCommuneNaissance': certification.birthplace,
          'cpf:codePaysNaissance': certification.birthCountryCode,
          'cpf:libellePaysNaissance': certification.birthCountryPlace,
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
