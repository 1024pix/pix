import dayjs from 'dayjs';

import { Training } from '../../../../../src/devcomp/domain/models/Training.js';
import * as tooling from '../../common/tooling/index.js';
import { acceptPixOrgaTermsOfService } from '../../common/tooling/legal-documents.js';
import { TEAM_EVALUATION_OFFSET_ID } from '../constants.js';

// POC moteur de reco : utilisateur ayant une participation partagée sur une campagne
// avec la fonctionnalité "moteur de reco", des contenus recommandés (dont un mis en avant),
// des badges obtenus / non obtenus et des paliers.
// Connexion : eval-campaign-reco@example.net / pix123 — campagne EVALRECO
export default async function initUser(databaseBuilder) {
  const ALL_PURPOSE_ID = TEAM_EVALUATION_OFFSET_ID + 50;

  const user = databaseBuilder.factory.buildUser.withRawPassword({
    id: ALL_PURPOSE_ID,
    firstName: 'User moteur de reco',
    lastName: 'Team Eval',
    email: 'eval-campaign-reco@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: false,
  });

  acceptPixOrgaTermsOfService(databaseBuilder, ALL_PURPOSE_ID);

  const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
    userId: user.id,
    organizationId: TEAM_EVALUATION_OFFSET_ID,
  });

  // Profil cible couvrant un maximum de compétences du référentiel cœur (les 5 domaines)
  const { targetProfileId, cappedTubesDTO } = await tooling.targetProfile.createTargetProfile({
    databaseBuilder,
    targetProfileId: ALL_PURPOSE_ID,
    name: 'Profil cible moteur de reco',
    isSimplifiedAccess: false,
    description: 'Profil cible pour le POC du nouveau design moteur de reco',
    configTargetProfile: {
      frameworks: [
        {
          chooseCoreFramework: true,
          countTubes: 80,
          minLevel: 3,
          maxLevel: 6,
        },
      ],
    },
  });
  databaseBuilder.factory.buildTargetProfileShare({
    organizationId: TEAM_EVALUATION_OFFSET_ID,
    targetProfileId,
  });

  // Paliers à seuils fixes : le palier 0 + 5 paliers = 5 étoiles max
  const stageIds = [0, 20, 40, 60, 80, 100].map(
    (threshold) =>
      databaseBuilder.factory.buildStage({
        targetProfileId,
        threshold,
        level: null,
        isFirstSkill: false,
        title: `Palier ${threshold} %`,
        message: `Message du palier ${threshold} %`,
      }).id,
  );
  // Paliers acquis : tous sauf le dernier => 4/5 étoiles
  const acquiredStageIds = stageIds.slice(0, 5);

  // Badges
  const badgesToCreate = [
    {
      title: 'J’utilise la visio',
      message:
        'Je connais les outils de visioconférence et je sais m’en servir pour participer à des réunions en ligne (rejoindre, activer le micro, la caméra, etc.).',
      imageUrl: 'https://assets.pix.org/badges/Pix_plus_Edu-Initie-PREMIER-DEGRE.svg',
      isAcquired: true,
    },
    {
      title: 'Je maîtrise la bureautique',
      message:
        'Je sais rédiger un document et le mettre en forme (police, alignement, titres) avec les principaux logiciels bureautiques (traitement de texte, tableur).',
      imageUrl: 'https://assets.pix.org/badges/Pix_plus_Edu-2-Confirme-certif.svg',
      isAcquired: true,
    },
    {
      title: 'Je navigue en sécurité',
      message: 'Je sais reconnaître un site frauduleux et protéger mes mots de passe.',
      imageUrl: 'https://assets.pix.org/badges/Badge_Pixome%CC%80tre-plane%CC%80te.svg',
      isAcquired: true,
    },
    {
      title: 'Je communique en ligne',
      message: 'Je sais envoyer un courriel avec une pièce jointe et répondre à plusieurs destinataires.',
      imageUrl: 'https://assets.pix.org/badges/Pix_plus_Droit- Pret-certif_Bronze--Initie.svg',
      isAcquired: true,
    },
    {
      title: 'Je gère mes démarches',
      message: 'Je sais créer un compte sur un site administratif et y déposer un justificatif.',
      imageUrl: 'https://assets.pix.org/badges/Pix_plus_Edu-2-Confirme.svg',
      isAcquired: true,
    },
    {
      title: 'Je stocke mes fichiers',
      message: 'Je sais enregistrer, renommer et retrouver mes fichiers dans des dossiers.',
      imageUrl: 'https://assets.pix.org/badges/Pix_plus_Edu-3-Avance-certif.svg',
      isAcquired: true,
    },
    {
      title: 'Je partage dans le cloud',
      message: 'Je sais partager un document en ligne et gérer les droits d’accès.',
      imageUrl: 'https://assets.pix.org/badges/Pix_plus_Edu-Initie-PREMIER-DEGRE.svg',
      isAcquired: true,
    },
    {
      title: 'Je crée un tableau',
      message: 'Je sais créer un tableau simple avec des formules de calcul.',
      imageUrl: 'https://assets.pix.org/badges/Pix_plus_Edu-3-Avance-certif.svg',
      isAcquired: false,
    },
    {
      title: 'Je programme',
      message: 'Je sais écrire un petit programme avec des boucles et des conditions.',
      imageUrl: 'https://assets.pix.org/badges/Pix_plus_Edu-2-Confirme.svg',
      isAcquired: false,
    },
  ];

  const builtBadges = [];
  for (const [index, badge] of badgesToCreate.entries()) {
    const badgeId = ALL_PURPOSE_ID + index;
    await tooling.targetProfile.createBadge({
      databaseBuilder,
      targetProfileId,
      cappedTubesDTO,
      badgeId,
      key: `SOME_KEY_FOR_RT_RECO_${badgeId}`,
      altMessage: badge.title,
      imageUrl: badge.imageUrl,
      message: badge.message,
      title: badge.title,
      isCertifiable: false,
      isAlwaysVisible: true,
      configBadge: {
        criteria: [{ scope: 'CampaignParticipation', threshold: badge.isAcquired ? 0 : 100 }],
      },
    });
    builtBadges.push({ badgeId, isAcquired: badge.isAcquired });
  }

  // Contenus formatifs
  const commonTrainingProps = {
    link: 'https://example.net',
    locales: ['fr', 'fr-fr', 'en'],
    objectives: ['Comprendre les bases', 'Mettre en pratique', 'Gagner en autonomie'],
    program: '<p>Programme détaillé du contenu formatif.</p>',
  };
  const trainingsToCreate = [
    {
      title: 'Comment font les IA génératives pour répondre à nos demandes ?',
      duration: '00:45:00',
      editorName: 'France Travail',
      editorLogoUrl: 'https://assets.pix.org/contenu-formatif/editeur/france-travail.svg',
      type: 'external-service',
      deliveryMode: Training.modes.REMOTE,
      registrationRequired: false,
    },
    {
      title: 'Comment font les IA génératives pour répondre à nos demandes et à nos questions ?',
      duration: '00:45:00',
      editorName: 'France Travail',
      editorLogoUrl: 'https://assets.pix.org/contenu-formatif/editeur/france-travail.svg',
      type: 'external-service',
      deliveryMode: Training.modes.REMOTE,
      registrationRequired: false,
    },
    {
      title: 'Découvrir les bases de la cybersécurité',
      duration: '00:45:00',
      editorName: 'Pix',
      editorLogoUrl: 'https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg',
      type: 'autoformation',
      deliveryMode: Training.modes.REMOTE,
      registrationRequired: false,
    },
    {
      title: 'Atelier dans votre agence France Travail',
      duration: '00:45:00',
      editorName: 'France Travail',
      editorLogoUrl: 'https://assets.pix.org/contenu-formatif/editeur/france-travail.svg',
      type: 'in-person-training',
      deliveryMode: Training.modes.ONSITE,
      registrationRequired: true,
    },
    {
      title: 'Atelier numérique : créer sa boîte mail',
      duration: '01:30:00',
      editorName: 'France Travail',
      editorLogoUrl: 'https://assets.pix.org/contenu-formatif/editeur/france-travail.svg',
      type: 'hybrid-training',
      deliveryMode: Training.modes.HYBRID,
      registrationRequired: true,
    },
    {
      title: 'Webinaire : protéger ses données personnelles',
      duration: '00:45:00',
      editorName: 'Pix',
      editorLogoUrl: 'https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg',
      type: 'webinaire',
      deliveryMode: Training.modes.REMOTE,
      registrationRequired: false,
    },
  ];
  const trainingIds = trainingsToCreate.map(
    (training) =>
      databaseBuilder.factory.buildTraining({
        ...commonTrainingProps,
        ...training,
        internalTitle: training.title,
      }).id,
  );
  trainingIds.forEach((trainingId) =>
    databaseBuilder.factory.buildTargetProfileTraining({ targetProfileId, trainingId }),
  );

  // Campagne avec moteur de reco, le premier contenu est mis en avant
  const { campaignId } = await tooling.campaign.createAssessmentCampaign({
    databaseBuilder,
    organizationId: TEAM_EVALUATION_OFFSET_ID,
    ownerId: TEAM_EVALUATION_OFFSET_ID,
    name: 'Campagne moteur de reco - nouveau design',
    title: 'Parcours moteur de reco',
    code: 'EVALRECO',
    targetProfileId,
    externalIdLabel: null,
    configCampaign: { participantCount: 0 },
    recommendationEngine: true,
    highlightedTrainingIds: [trainingIds[0]],
  });

  const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
    campaignId,
    userId: user.id,
    organizationLearnerId: organizationLearner.id,
    masteryRate: 1,
    pixScore: 500,
    validatedSkillsCount: 50,
    isCertifiable: true,
    status: 'SHARED',
    sharedAt: new Date(),
  });

  for (const { badgeId } of builtBadges.filter(({ isAcquired }) => isAcquired)) {
    databaseBuilder.factory.buildBadgeAcquisition({
      badgeId,
      userId: user.id,
      campaignParticipationId: campaignParticipation.id,
    });
  }

  // reachedStage est lu depuis stage-acquisitions (normalement écrit en fin de parcours)
  acquiredStageIds.forEach((stageId) =>
    databaseBuilder.factory.buildStageAcquisition({
      stageId,
      campaignParticipationId: campaignParticipation.id,
    }),
  );

  trainingIds.forEach((trainingId) =>
    databaseBuilder.factory.buildUserRecommendedTraining({
      userId: user.id,
      trainingId,
      campaignParticipationId: campaignParticipation.id,
    }),
  );

  const assessment = databaseBuilder.factory.buildAssessment({
    userId: user.id,
    type: 'CAMPAIGN',
    campaignParticipationId: campaignParticipation.id,
  });
  databaseBuilder.factory.buildAssessmentResult({ assessmentId: assessment.id });

  // Les KE doivent être antérieurs à sharedAt pour être pris en compte dans les résultats
  const answersAndKEFromAdvancedProfile = await tooling.profile.getAnswersAndKnowledgeElementsForAdvancedProfile();
  for (const { answerData, keData } of answersAndKEFromAdvancedProfile) {
    const answer = databaseBuilder.factory.buildAnswer({ assessmentId: assessment.id, answerData });
    databaseBuilder.factory.buildKnowledgeElement({
      assessmentId: assessment.id,
      answerId: answer.id,
      userId: user.id,
      ...keData,
      createdAt: dayjs().subtract(1, 'day').toDate(),
    });
  }
}
