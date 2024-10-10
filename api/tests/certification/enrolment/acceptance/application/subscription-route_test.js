import { ComplementaryCertificationKeys } from '../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

describe('Certification | Enrolment | Acceptance | Application | Routes | subscription', function () {
  describe('GET /api/certification-candidates/{certificationCandidateId}/subscriptions', function () {
    it('should return the certification candidate subscriptions', async function () {
      // given
      const server = await createServer();

      const learningContent = learningContentBuilder.fromAreas([
        {
          id: 'recvoGdo7z2z7pXWa',
          title_i18n: {
            fr: 'Information et données',
          },
          color: 'jaffa',
          code: '1',
          competences: [
            {
              id: 'recCompetence1',
              name_i18n: {
                fr: 'Mener une recherche et une veille d’information',
              },
              index: '1.1',
              origin: 'Pix',
              areaId: 'recvoGdo7z2z7pXWa',
              thematics: [
                {
                  id: 'recThemCompetence1',
                  tubes: [
                    {
                      id: 'recTubeCompetence1',
                      skills: [
                        {
                          id: 'skillId@web3',
                          name: '@web3',
                          status: 'actif',
                          level: 3,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'recCompetence2',
              name_i18n: {
                fr: 'Gérer les données',
              },
              index: '1.2',
              origin: 'Pix',
              areaId: 'recvoGdo7z2z7pXWa',
              thematics: [
                {
                  id: 'recThemCompetence2',
                  tubes: [
                    {
                      id: 'recTubeCompetence2',
                      skills: [
                        {
                          id: 'skillId@fichier3',
                          name: '@fichier3',
                          status: 'actif',
                          level: 3,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'recCompetence3',
              name_i18n: {
                fr: 'Traiter les données',
              },
              index: '1.3',
              origin: 'Pix',
              areaId: 'recvoGdo7z2z7pXWa',
              thematics: [
                {
                  id: 'recThemCompetence3',
                  tubes: [
                    {
                      id: 'recTubeCompetence3',
                      skills: [
                        {
                          id: 'skillId@tri3',
                          name: '@tri3',
                          status: 'actif',
                          level: 3,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'recDH19F7kKrfL3Ii',
          title_i18n: {
            fr: 'Communication et collaboration',
          },
          color: 'jaffa',
          code: '1',
          competences: [
            {
              id: 'recCompetence4',
              name_i18n: {
                fr: 'Intéragir',
              },
              index: '2.1',
              origin: 'Pix',
              areaId: 'recDH19F7kKrfL3Ii',
              thematics: [
                {
                  id: 'recThemCompetence4',
                  tubes: [
                    {
                      id: 'recTubeCompetence4',
                      skills: [
                        {
                          id: 'skillId@spam3',
                          name: '@spam3',
                          status: 'actif',
                          level: 3,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'recCompetence5',
              name_i18n: {
                fr: 'Partager et publier',
              },
              index: '2.2',
              origin: 'Pix',
              areaId: 'recDH19F7kKrfL3Ii',
              thematics: [
                {
                  id: 'recThemCompetence5',
                  tubes: [
                    {
                      id: 'recTubeCompetence5',
                      skills: [
                        {
                          id: 'skillId@vocRS3',
                          name: '@vocRS3',
                          status: 'actif',
                          level: 3,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);
      mockLearningContent(learningContent);

      const userId = databaseBuilder.factory.buildUser().id;

      learningContent.skills.forEach(({ id: skillId, competenceId }) => {
        databaseBuilder.factory.buildKnowledgeElement({ userId, earnedPix: 10, competenceId, skillId });
      });

      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const badgeId = databaseBuilder.factory.buildBadge({ isCertifiable: true, targetProfileId }).id;
      const campaignId = databaseBuilder.factory.buildCampaign({
        targetProfileId,
      }).id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        isCertifiable: true,
        userId,
      }).id;

      learningContent.skills.forEach(({ id: skillId }) => {
        databaseBuilder.factory.buildCampaignSkill({
          campaignId,
          skillId,
        });
      });

      databaseBuilder.factory.buildBadgeCriterion({
        badgeId,
        threshold: 75,
        cappedTubes: JSON.stringify(
          learningContent.tubes.map(({ id }) => ({
            id,
            level: 8,
          })),
        ),
      });

      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        key: ComplementaryCertificationKeys.CLEA,
        label: 'CléA Numérique',
      });

      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: certificationCenter.id,
        complementaryCertificationId: cleaComplementaryCertification.id,
      });

      const session = databaseBuilder.factory.buildSession({
        certificationCenterId: certificationCenter.id,
      });

      const candidate = databaseBuilder.factory.buildCertificationCandidate({
        sessionId: session.id,
        userId,
        reconciledAt: new Date('2021-01-01'),
      });

      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });

      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        certificationCandidateId: candidate.id,
        complementaryCertificationId: cleaComplementaryCertification.id,
      });

      databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId,
        complementaryCertificationId: cleaComplementaryCertification.id,
      });

      databaseBuilder.factory.buildBadgeAcquisition({
        userId,
        badgeId,
        campaignParticipationId,
        createdAt: new Date('2020-01-01'),
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/certification-candidates/${candidate.id}/subscriptions`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId, 'pix-certif') },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal({
        id: `${candidate.id}`,
        type: 'certification-candidate-subscriptions',
        attributes: {
          'session-id': session.id,
          'session-version': session.version,
          'eligible-subscriptions': [
            {
              label: null,
              type: 'CORE',
            },
            {
              label: 'CléA Numérique',
              type: 'COMPLEMENTARY',
            },
          ],
          'non-eligible-subscription': null,
        },
      });
    });
  });
});
