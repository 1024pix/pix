import { Knex } from 'knex';

import { createTargetProfileInDB, createTargetProfileTubesInDB } from '../../db.ts';
import { CERTIFICATIONS_DATA } from '../../db-data.ts';

export async function buildCleaData(knex: Knex): Promise<number> {
  const { id: cleaCertificationId } = await knex('complementary-certifications')
    .select('id')
    .where({ key: CERTIFICATIONS_DATA.CLEA })
    .first();
  const cleaTargetProfileId = await buildTargetProfile(knex);
  const [{ id: cleaBadgeId }] = await knex('badges')
    .insert({
      targetProfileId: cleaTargetProfileId,
      message:
        'Bravo ! Vous maîtrisez les compétences indispensables pour utiliser le numérique en milieu professionnel. Pour valoriser vos compétences avec une double certification Pix-CléA numérique, renseignez-vous auprès de votre conseiller ou de votre formateur.',
      altMessage: 'Prêt pour le CléA numérique',
      key: CERTIFICATIONS_DATA.CLEA,
      imageUrl: 'https://assets.pix.org/badges/Logos_badge_Prêt-CléA_Num NEW 2020.svg',
      title: 'Prêt pour le CléA numérique V2',
      isCertifiable: true,
      isAlwaysVisible: true,
    })
    .returning('id');
  await knex('badge-criteria').insert({
    scope: 'CampaignParticipation',
    threshold: 80,
    cappedTubes: 'null',
    name: null,
    badgeId: cleaBadgeId,
  });
  await knex('complementary-certification-badges').insert({
    badgeId: cleaBadgeId,
    complementaryCertificationId: cleaCertificationId,
    level: 1,
    imageUrl: 'https://assets.pix.org/badges/CleA_Num_certif.svg',
    label: 'CléA Numérique',
    certificateMessage: null,
    temporaryCertificateMessage: null,
    stickerUrl: 'https://images.pix.fr/stickers/macaron_clea.pdf',
    createdAt: new Date('2021-01-01'),
    minimumEarnedPix: 256,
  });
  return cleaTargetProfileId;
}

async function buildTargetProfile(knex: Knex) {
  const tubeDTOs: { competenceId: string; tubeId: string }[] = await knex('learningcontent.tubes')
    .distinct()
    .select({
      competenceId: 'learningcontent.competences.id',
      tubeId: 'learningcontent.tubes.id',
    })
    .join('learningcontent.competences', 'learningcontent.tubes.competenceId', 'learningcontent.competences.id')
    .join('learningcontent.skills', 'learningcontent.skills.tubeId', 'learningcontent.tubes.id')
    .join('learningcontent.challenges', 'learningcontent.challenges.skillId', 'learningcontent.skills.id')
    .where('learningcontent.competences.origin', '=', 'Pix')
    .where('learningcontent.skills.status', 'actif')
    .where(
      (queryBuilder: {
        whereRaw: (arg0: string, arg1: string[]) => void;
        orWhereRaw: (arg0: string, arg1: string[]) => void;
      }) => {
        queryBuilder.whereRaw('? = ANY(learningcontent.challenges.locales)', ['fr']);
        queryBuilder.orWhereRaw('? = ANY(learningcontent.challenges.locales)', ['fr-fr']);
      },
    )
    .orderBy('learningcontent.tubes.id');
  const tubesByCompetenceId: Record<string, { competenceId: string; tubeId: string }[]> = Object.groupBy(
    tubeDTOs,
    (tubeDTO: { competenceId: string }) => tubeDTO.competenceId,
  ) as Record<string, { competenceId: string; tubeId: string }[]>;
  const tubeIds = [];
  for (const tubesForCompetence of Object.values(tubesByCompetenceId)) {
    if (!tubesForCompetence) continue;
    tubeIds.push(...tubesForCompetence.slice(0, 3).map((tubeDTO) => tubeDTO.tubeId));
  }
  const targetProfileId = await createTargetProfileInDB('Parcours complet CléA numérique');
  await createTargetProfileTubesInDB(targetProfileId, 4, tubeIds);
  return targetProfileId;
}
