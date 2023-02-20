const TABLE_NAME = 'complementary-certification-badges';
import { noop } from 'lodash';
const {
  PIX_EMPLOI_CLEA_V1,
  PIX_EMPLOI_CLEA_V2,
  PIX_EMPLOI_CLEA_V3,

  PIX_DROIT_EXPERT_CERTIF,
  PIX_DROIT_MAITRE_CERTIF,

  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,

  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,

  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
} = require('../constants').badges.keys;

const DROIT = 'Pix+ Droit';
const CLEA = 'CléA Numérique';
const EDU_1 = 'Pix+ Édu 1er degré';
const EDU_2 = 'Pix+ Édu 2nd degré';

const data = [
  {
    keys: [PIX_EMPLOI_CLEA_V1, PIX_EMPLOI_CLEA_V2, PIX_EMPLOI_CLEA_V3],
    level: 1,
    complementaryCourseKey: CLEA,
  },
  {
    keys: [PIX_DROIT_MAITRE_CERTIF],
    level: 1,
    complementaryCourseKey: DROIT,
  },
  {
    keys: [PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE],
    level: 1,
    complementaryCourseKey: EDU_1,
  },
  {
    keys: [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE],
    level: 1,
    complementaryCourseKey: EDU_2,
  },
  {
    keys: [PIX_DROIT_EXPERT_CERTIF],
    level: 2,
    complementaryCourseKey: DROIT,
  },
  {
    keys: [PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME],
    level: 2,
    complementaryCourseKey: EDU_1,
  },
  {
    keys: [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME],
    level: 2,
    complementaryCourseKey: EDU_2,
  },

  { keys: [PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME], level: 3, complementaryCourseKey: EDU_1 },
  { keys: [PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME], level: 3, complementaryCourseKey: EDU_2 },

  { keys: [PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE], level: 4, complementaryCourseKey: EDU_1 },
  { keys: [PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE], level: 4, complementaryCourseKey: EDU_2 },
  { keys: [PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT], level: 5, complementaryCourseKey: EDU_1 },
  { keys: [PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT], level: 5, complementaryCourseKey: EDU_2 },
];

export const up = async function (knex) {
  await _insertComplementaryCertifications();

  await knex(TABLE_NAME).del();

  const complementaryCertificationBadges = await _getCertifiableBadges();
  const complementaryCertifications = await knex('complementary-certifications').select('id', 'name');

  const insertData = data.reduce((array, { keys, level, complementaryCourseKey }) => {
    const complementaryCertification = complementaryCertifications.find(({ name }) => name === complementaryCourseKey);
    keys.forEach((badgeKey) => {
      const badge = complementaryCertificationBadges.find(({ key }) => key === badgeKey);
      if (!badge) return;
      array.push({
        complementaryCertificationId: complementaryCertification.id,
        level,
        badgeId: badge.id,
      });
    });

    return array;
  }, []);
  await knex.batchInsert(TABLE_NAME, insertData);

  async function _insertComplementaryCertifications() {
    const complementaryCertifications = await knex('complementary-certifications').select('name').pluck('name');
    if (!complementaryCertifications.includes(DROIT))
      await knex('complementary-certifications').insert({ name: DROIT });
    if (!complementaryCertifications.includes(CLEA)) await knex('complementary-certifications').insert({ name: CLEA });
    if (!complementaryCertifications.includes(EDU_1))
      await knex('complementary-certifications').insert({ name: EDU_1 });
    if (!complementaryCertifications.includes(EDU_2))
      await knex('complementary-certifications').insert({ name: EDU_2 });
  }

  async function _getCertifiableBadges() {
    return knex('badges')
      .select('id', 'key')
      .whereIn('key', [
        PIX_EMPLOI_CLEA_V1,
        PIX_EMPLOI_CLEA_V2,
        PIX_EMPLOI_CLEA_V3,
        PIX_DROIT_EXPERT_CERTIF,
        PIX_DROIT_MAITRE_CERTIF,
        PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
        PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
        PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
        PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
        PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
        PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
        PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
        PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
        PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
        PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
      ]);
  }
};

export const down = async function () {
  noop;
};
