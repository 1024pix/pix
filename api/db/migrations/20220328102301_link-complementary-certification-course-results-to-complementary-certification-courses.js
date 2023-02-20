const COMPLEMENTARY_CERTIFICATIONS_TABLE = 'complementary-certifications';
const COMPLEMENTARY_CERTIFICATION_COURSES_TABLE = 'complementary-certification-courses';
const COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE = 'complementary-certification-course-results';
const COMPLEMENTARY_CERTIFICATION_COURSE_ID_COLUMN = 'complementaryCertificationCourseId';
const CERTIFICATION_COURSE_ID = 'certificationCourseId';
import uniqBy from 'lodash/uniqBy';
import bluebird from 'bluebird';
const {
  PIX_EMPLOI_CLEA,
  PIX_EMPLOI_CLEA_V2,
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
} = require('../constants').badges.keys;

const PIX_PLUS_EDU = 'Pix+ Édu';
const PIX_PLUS_DROIT = 'Pix+ Droit';
const CLEA = 'CléA Numérique';

export const up = async function (knex) {
  const complementaryCertifications = await knex(COMPLEMENTARY_CERTIFICATIONS_TABLE).select('*');
  await _alterComplementaryCertificationCourseResultsForeignKey();
  await _addMissingComplementaryCertificationCourses();
  await _updateComplementaryCertificationCourseResultsForeignKeys();
  await _dropColumnCertificationCourse();
  await _setForeignKeyNotNullable();

  async function _setForeignKeyNotNullable() {
    await knex.schema.alterTable(COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE, (table) => {
      table.bigInteger(COMPLEMENTARY_CERTIFICATION_COURSE_ID_COLUMN).notNullable().alter();
    });
  }

  async function _alterComplementaryCertificationCourseResultsForeignKey() {
    await knex.schema.table(COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE, async (table) => {
      table.increments('id').primary();
      table
        .bigInteger(COMPLEMENTARY_CERTIFICATION_COURSE_ID_COLUMN)
        .nullable()
        .references('complementary-certification-courses.id');
    });
  }

  async function _updateComplementaryCertificationCourseResultsForeignKeys() {
    const complementaryCertifCourseIdForComplementaryCertifCourseResultIds =
      await _getComplementaryCertifCourseIdForComplementaryCertifCourseResultId();

    return bluebird.mapSeries(
      complementaryCertifCourseIdForComplementaryCertifCourseResultIds,
      async ({ complementaryCertificationCourseResultId, complementaryCertificationCourseId }) => {
        await knex(COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE)
          .update(COMPLEMENTARY_CERTIFICATION_COURSE_ID_COLUMN, complementaryCertificationCourseId)
          .where({ id: complementaryCertificationCourseResultId });
      }
    );
  }

  async function _addMissingComplementaryCertificationCourses() {
    const missingComplementaryCertifCourses = await _buildMissingComplementaryCertificationCourses();

    return knex
      .batchInsert(COMPLEMENTARY_CERTIFICATION_COURSES_TABLE, missingComplementaryCertifCourses)
      .returning(['id', CERTIFICATION_COURSE_ID]);
  }

  async function _getComplementaryCertifCourseIdForComplementaryCertifCourseResultId() {
    const complementaryCertificationCourses = await knex(COMPLEMENTARY_CERTIFICATION_COURSES_TABLE).select('*');
    const complementaryCertificationCourseResults = await knex(COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE).select(
      '*'
    );

    return complementaryCertificationCourseResults.map((cccr) => {
      const complementaryCertificationCourseResultId = cccr.id;
      const certificationCourseId = cccr.certificationCourseId;
      const complementaryCertificationId = _getComplementaryCertificationId({
        partnerKey: cccr.partnerKey || cccr.temporaryPartnerKey,
      });

      const complementaryCertificationCourseId = complementaryCertificationCourses.find(
        (ccc) =>
          ccc.complementaryCertificationId === complementaryCertificationId &&
          ccc.certificationCourseId === certificationCourseId
      ).id;

      return { complementaryCertificationCourseResultId, complementaryCertificationCourseId };
    });
  }

  async function _buildMissingComplementaryCertificationCourses() {
    const complementaryCertifCourseResults =
      await _getComplementaryCertifCourseResultsWithoutComplementaryCertifCourse();

    const missingComplementaryCertificationCourses = complementaryCertifCourseResults
      .map(({ certificationCourseId, partnerKey, temporaryPartnerKey }) => {
        return {
          certificationCourseId,
          complementaryCertificationId: _getComplementaryCertificationId({
            partnerKey: partnerKey || temporaryPartnerKey,
          }),
        };
      })
      .filter(({ complementaryCertificationId }) => Boolean(complementaryCertificationId));

    return uniqBy(missingComplementaryCertificationCourses, ({ certificationCourseId }) => certificationCourseId);
  }

  function _getComplementaryCertifCourseResultsWithoutComplementaryCertifCourse() {
    return (
      knex
        .select('*')
        .from(COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE)
        // eslint-disable-next-line knex/avoid-injections
        .whereRaw(
          `"${CERTIFICATION_COURSE_ID}" not in (select "${CERTIFICATION_COURSE_ID}" from "complementary-certification-courses")`
        )
    );
  }

  function _getComplementaryCertificationId({ partnerKey }) {
    const getIdFromName = (searchName) => complementaryCertifications.find(({ name }) => name === searchName).id;
    switch (partnerKey) {
      case PIX_EMPLOI_CLEA:
        return getIdFromName(CLEA);
      case PIX_EMPLOI_CLEA_V2:
        return getIdFromName(CLEA);
      case PIX_DROIT_EXPERT_CERTIF:
        return getIdFromName(PIX_PLUS_DROIT);
      case PIX_DROIT_MAITRE_CERTIF:
        return getIdFromName(PIX_PLUS_DROIT);
      case PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE:
        return getIdFromName(PIX_PLUS_EDU);
      case PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME:
        return getIdFromName(PIX_PLUS_EDU);
      case PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT:
        return getIdFromName(PIX_PLUS_EDU);
      case PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME:
        return getIdFromName(PIX_PLUS_EDU);
      case PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE:
        return getIdFromName(PIX_PLUS_EDU);
    }
  }

  async function _dropColumnCertificationCourse() {
    await knex.schema.table(COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE, async (table) => {
      table.dropColumn(CERTIFICATION_COURSE_ID);
    });
  }
};

export const down = async function (knex) {
  await knex.schema.table(COMPLEMENTARY_CERTIFICATION_COURSE_RESULTS_TABLE, async (table) => {
    table
      .dropColumn(COMPLEMENTARY_CERTIFICATION_COURSE_ID_COLUMN)
      .nullable()
      .references('complementary-certification-courses.id');
  });
};
