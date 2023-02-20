const {
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
} = require('../constants').badges.keys;

export const up = async function (knex) {
  await knex('complementary-certifications').update({ name: 'Pix+ Édu 2nd degré' }).where({ name: 'Pix+ Édu' });

  const [{ id: pixEdu1erDegreComplementaryCertificationId }] = await knex('complementary-certifications')
    .insert({ name: 'Pix+ Édu 1er degré' })
    .returning('id');

  const pixEdu1erDegreComplementaryCertificationCourseIds = await knex('complementary-certification-course-results')
    .select('complementaryCertificationCourseId')
    .distinct()
    .whereIn('partnerKey', [
      PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
      PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
    ]);

  await knex('complementary-certification-courses')
    .update({
      complementaryCertificationId: pixEdu1erDegreComplementaryCertificationId,
    })
    .whereIn(
      'id',
      pixEdu1erDegreComplementaryCertificationCourseIds.map(
        ({ complementaryCertificationCourseId }) => complementaryCertificationCourseId
      )
    );
};

export const down = async function (knex) {
  const pixEdu1erDegreComplementaryCertificationCourseIds = await knex('complementary-certification-course-results')
    .select('complementaryCertificationCourseId')
    .distinct()
    .whereIn('partnerKey', [
      PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
      PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
      PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
    ]);

  const { id: pixEdu2ndDegreComplementaryCertificationId } = await knex('complementary-certifications')
    .select('id')
    .where({
      name: 'Pix+ Édu 2nd degré',
    })
    .first();

  await knex('complementary-certification-courses')
    .update({
      complementaryCertificationId: pixEdu2ndDegreComplementaryCertificationId,
    })
    .whereIn(
      'id',
      pixEdu1erDegreComplementaryCertificationCourseIds.map(
        ({ complementaryCertificationCourseId }) => complementaryCertificationCourseId
      )
    );

  await knex('complementary-certifications').where({ name: 'Pix+ Édu 1er degré' }).delete();

  await knex('complementary-certifications').update({ name: 'Pix+ Édu' }).where({ name: 'Pix+ Édu 2nd degré' });
};
