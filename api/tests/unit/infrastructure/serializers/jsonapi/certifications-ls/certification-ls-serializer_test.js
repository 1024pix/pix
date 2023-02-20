import { expect } from '../../../../../test-helper';
import serializer from '../../../../../../lib/infrastructure/serializers/jsonapi/certifications-livret-scolaire/certification-ls-serializer.js';

import {
  buildCertificateForLS,
  buildReferentialOfCompetences,
  buildCertificationsResults,
} from '../../../../../../lib/infrastructure/serializers/jsonapi/certifications-livret-scolaire/factory/build-certification-result-for-ls';

const VALIDATED_CERTIFICATION = 'validated';
const REJECTED_CERTIFICATION = 'rejected';

describe('Unit | Serializer | JSONAPI | certification-ls-serializer', function () {
  describe('#serialize', function () {
    context('the entry data is one valid certification with a referential of competences', function () {
      const expectedJson = {
        data: {
          attributes: {
            certifications: [
              {
                birthdate: '1992-06-12',
                certificationCenter: 'ToonsVille',
                competenceResults: [
                  {
                    competenceId: '1.1',
                    level: 4,
                  },
                  {
                    competenceId: '1.2',
                    level: 4,
                  },
                  {
                    competenceId: '1.3',
                    level: 4,
                  },
                  {
                    competenceId: '2.1',
                    level: 4,
                  },
                  {
                    competenceId: '2.2',
                    level: 4,
                  },
                  {
                    competenceId: '2.3',
                    level: 4,
                  },
                ],
                date: '2018-12-01T01:02:03Z',
                deliveredAt: '2018-10-03T01:02:03Z',
                firstName: 'Jean',
                id: 1,
                lastName: 'Bon',
                middleName: 'Jerry',
                nationalStudentId: 'nationalStudentId1',
                pixScore: 320,
                status: 'validated',
                thirdName: 'Bobby',
                verificationCode: 'P-BBBCCCDD',
              },
            ],
          },
          relationships: {
            competences: {
              data: [
                {
                  id: '1.1',
                  type: 'competences',
                },
                {
                  id: '1.2',
                  type: 'competences',
                },
                {
                  id: '1.3',
                  type: 'competences',
                },
                {
                  id: '2.1',
                  type: 'competences',
                },
                {
                  id: '2.2',
                  type: 'competences',
                },
                {
                  id: '2.3',
                  type: 'competences',
                },
              ],
            },
          },
          type: 'certificationsResults',
        },
        included: [
          {
            attributes: {
              name: '1. Information et données',
            },
            id: '1',
            relationships: {},
            type: 'areas',
          },
          {
            attributes: {
              name: 'Mener une recherche et une veille d’information',
            },
            id: '1.1',
            relationships: {
              area: {
                data: {
                  id: '1',
                  type: 'areas',
                },
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              name: 'Mener une recherche et une veille d’information',
            },
            id: '1.2',
            relationships: {
              area: {
                data: {
                  id: '1',
                  type: 'areas',
                },
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              name: 'Mener une recherche et une veille d’information',
            },
            id: '1.3',
            relationships: {
              area: {
                data: {
                  id: '1',
                  type: 'areas',
                },
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              name: '2. Communication et collaboration',
            },
            id: '2',
            relationships: {},
            type: 'areas',
          },
          {
            attributes: {
              name: 'Interagir avec des individus et de petits groupes',
            },
            id: '2.1',
            relationships: {
              area: {
                data: {
                  id: '2',
                  type: 'areas',
                },
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              name: 'Partager et publier des informations et des contenus',
            },
            id: '2.2',
            relationships: {
              area: {
                data: {
                  id: '2',
                  type: 'areas',
                },
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              name: 'Collaborer dans un groupe pour réaliser un projet',
            },
            id: '2.3',
            relationships: {
              area: {
                data: {
                  id: '2',
                  type: 'areas',
                },
              },
            },
            type: 'competences',
          },
        ],
      };

      it('should serialize to certification result with a referential of competences', function () {
        // given
        const validCertification = buildCertificateForLS({ id: 1, status: VALIDATED_CERTIFICATION });
        const certificationsResults = buildCertificationsResults([validCertification]);

        // when
        const serializedCertifications = serializer.serialize(certificationsResults);

        // then
        expect(serializedCertifications).to.deep.equal(expectedJson);
      });
    });

    context('the entry data is one valid, one rejected certifications with a referential of competences', function () {
      const expectedJson = {
        data: {
          attributes: {
            certifications: [
              {
                birthdate: '1992-06-12',
                certificationCenter: 'ToonsVille',
                competenceResults: [
                  {
                    competenceId: '1.1',
                    level: 4,
                  },
                  {
                    competenceId: '1.2',
                    level: 4,
                  },
                  {
                    competenceId: '1.3',
                    level: 4,
                  },
                  {
                    competenceId: '2.1',
                    level: 4,
                  },
                  {
                    competenceId: '2.2',
                    level: 4,
                  },
                  {
                    competenceId: '2.3',
                    level: 4,
                  },
                ],
                date: '2018-12-01T01:02:03Z',
                deliveredAt: '2018-10-03T01:02:03Z',
                firstName: 'Jean',
                id: 1,
                lastName: 'Bon',
                middleName: 'Jerry',
                nationalStudentId: 'nationalStudentId1',
                pixScore: 320,
                status: 'validated',
                thirdName: 'Bobby',
                verificationCode: 'P-BBBCCCDD',
              },
              {
                birthdate: '1992-06-12',
                certificationCenter: 'ToonsVille',
                competenceResults: [
                  {
                    competenceId: '1.1',
                    level: 4,
                  },
                  {
                    competenceId: '1.2',
                    level: 4,
                  },
                  {
                    competenceId: '1.3',
                    level: 4,
                  },
                  {
                    competenceId: '2.1',
                    level: 4,
                  },
                  {
                    competenceId: '2.2',
                    level: 4,
                  },
                  {
                    competenceId: '2.3',
                    level: 4,
                  },
                ],
                date: '2018-12-01T01:02:03Z',
                deliveredAt: '2018-10-03T01:02:03Z',
                firstName: 'Jean',
                id: 2,
                lastName: 'Bon',
                middleName: 'Jerry',
                nationalStudentId: 'nationalStudentId1',
                pixScore: 320,
                status: 'rejected',
                thirdName: 'Bobby',
                verificationCode: 'P-BBBCCCDD',
              },
            ],
          },
          relationships: {
            competences: {
              data: [
                {
                  id: '1.1',
                  type: 'competences',
                },
                {
                  id: '1.2',
                  type: 'competences',
                },
                {
                  id: '1.3',
                  type: 'competences',
                },
                {
                  id: '2.1',
                  type: 'competences',
                },
                {
                  id: '2.2',
                  type: 'competences',
                },
                {
                  id: '2.3',
                  type: 'competences',
                },
              ],
            },
          },
          type: 'certificationsResults',
        },
        included: [
          {
            attributes: {
              name: '1. Information et données',
            },
            id: '1',
            relationships: {},
            type: 'areas',
          },
          {
            attributes: {
              name: 'Mener une recherche et une veille d’information',
            },
            id: '1.1',
            relationships: {
              area: {
                data: {
                  id: '1',
                  type: 'areas',
                },
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              name: 'Mener une recherche et une veille d’information',
            },
            id: '1.2',
            relationships: {
              area: {
                data: {
                  id: '1',
                  type: 'areas',
                },
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              name: 'Mener une recherche et une veille d’information',
            },
            id: '1.3',
            relationships: {
              area: {
                data: {
                  id: '1',
                  type: 'areas',
                },
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              name: '2. Communication et collaboration',
            },
            id: '2',
            relationships: {},
            type: 'areas',
          },
          {
            attributes: {
              name: 'Interagir avec des individus et de petits groupes',
            },
            id: '2.1',
            relationships: {
              area: {
                data: {
                  id: '2',
                  type: 'areas',
                },
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              name: 'Partager et publier des informations et des contenus',
            },
            id: '2.2',
            relationships: {
              area: {
                data: {
                  id: '2',
                  type: 'areas',
                },
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              name: 'Collaborer dans un groupe pour réaliser un projet',
            },
            id: '2.3',
            relationships: {
              area: {
                data: {
                  id: '2',
                  type: 'areas',
                },
              },
            },
            type: 'competences',
          },
        ],
      };

      it('should serialize to certifications results with a referential of competences', function () {
        // given
        const validCertification = buildCertificateForLS({ id: 1, status: VALIDATED_CERTIFICATION });
        const rejectedCertification = buildCertificateForLS({ id: 2, status: REJECTED_CERTIFICATION });

        const certificationsResults = buildCertificationsResults([validCertification, rejectedCertification]);

        // when
        const serializedCertifications = serializer.serialize(certificationsResults);

        // then
        expect(serializedCertifications).to.deep.equal(expectedJson);
      });
    });

    context('the entry data is a referential of competences only', function () {
      const expectedJson = {
        data: {
          attributes: {
            certifications: [],
          },
          relationships: {
            competences: {
              data: [
                {
                  id: '1.1',
                  type: 'competences',
                },
                {
                  id: '1.2',
                  type: 'competences',
                },
                {
                  id: '1.3',
                  type: 'competences',
                },
                {
                  id: '2.1',
                  type: 'competences',
                },
                {
                  id: '2.2',
                  type: 'competences',
                },
                {
                  id: '2.3',
                  type: 'competences',
                },
              ],
            },
          },
          type: 'certificationsResults',
        },
        included: [
          {
            attributes: {
              name: '1. Information et données',
            },
            id: '1',
            relationships: {},
            type: 'areas',
          },
          {
            attributes: {
              name: 'Mener une recherche et une veille d’information',
            },
            id: '1.1',
            relationships: {
              area: {
                data: {
                  id: '1',
                  type: 'areas',
                },
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              name: 'Mener une recherche et une veille d’information',
            },
            id: '1.2',
            relationships: {
              area: {
                data: {
                  id: '1',
                  type: 'areas',
                },
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              name: 'Mener une recherche et une veille d’information',
            },
            id: '1.3',
            relationships: {
              area: {
                data: {
                  id: '1',
                  type: 'areas',
                },
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              name: '2. Communication et collaboration',
            },
            id: '2',
            relationships: {},
            type: 'areas',
          },
          {
            attributes: {
              name: 'Interagir avec des individus et de petits groupes',
            },
            id: '2.1',
            relationships: {
              area: {
                data: {
                  id: '2',
                  type: 'areas',
                },
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              name: 'Partager et publier des informations et des contenus',
            },
            id: '2.2',
            relationships: {
              area: {
                data: {
                  id: '2',
                  type: 'areas',
                },
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              name: 'Collaborer dans un groupe pour réaliser un projet',
            },
            id: '2.3',
            relationships: {
              area: {
                data: {
                  id: '2',
                  type: 'areas',
                },
              },
            },
            type: 'competences',
          },
        ],
      };

      it('should serialize to empty certifications results with a referential of competences', function () {
        // given
        const competences = buildReferentialOfCompetences();
        const certificationsResultsWithNoCertifications = buildCertificationsResults([], competences);

        // when
        const serializedCertifications = serializer.serialize(certificationsResultsWithNoCertifications);

        // then
        expect(serializedCertifications).to.deep.equal(expectedJson);
      });
    });
  });
});
