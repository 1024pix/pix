const buildBadge = require('./build-badge');
const buildComplementaryCertification = require('./build-complementary-certification');
const CertifiableBadgeAcquisition = require('../../../../lib/domain/models/CertifiableBadgeAcquisition');
const {
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
  PIX_EMPLOI_CLEA_V1,
  PIX_EMPLOI_CLEA_V2,
  PIX_EMPLOI_CLEA_V3,
} = require('../../../../lib/domain/models/Badge').keys;

const buildCertifiableBadgeAcquisition = function ({
  id = 123,
  userId = 456,
  campaignId = 456,
  badge,
  complementaryCertification,
} = {}) {
  badge = badge || buildBadge({ id: 1234 });
  complementaryCertification = complementaryCertification || buildComplementaryCertification();
  return new CertifiableBadgeAcquisition({
    id,
    userId,
    campaignId,
    badge,
    complementaryCertification,
  });
};

buildCertifiableBadgeAcquisition.forPixEduFormationContinue2ndDegreExpert = function (complementaryCertification) {
  return buildCertifiableBadgeAcquisition({
    badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT }),
    complementaryCertification,
  });
};

buildCertifiableBadgeAcquisition.forPixEduFormationContinue2ndDegreAvance = function (complementaryCertification) {
  return buildCertifiableBadgeAcquisition({
    badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE }),
    complementaryCertification,
  });
};

buildCertifiableBadgeAcquisition.forPixEduFormationContinue2ndDegreConfirme = function (complementaryCertification) {
  return buildCertifiableBadgeAcquisition({
    badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME }),
    complementaryCertification,
  });
};

buildCertifiableBadgeAcquisition.forPixEduFormationInitiale2ndDegreConfirme = function (complementaryCertification) {
  return buildCertifiableBadgeAcquisition({
    badge: buildBadge({ key: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME }),
    complementaryCertification,
  });
};

buildCertifiableBadgeAcquisition.forPixEduFormationInitiale2ndDegreInitie = function (complementaryCertification) {
  return buildCertifiableBadgeAcquisition({
    badge: buildBadge({ key: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE }),
    complementaryCertification,
  });
};

buildCertifiableBadgeAcquisition.forPixEduFormationContinue1erDegreExpert = function (complementaryCertification) {
  return buildCertifiableBadgeAcquisition({
    badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT }),
    complementaryCertification,
  });
};

buildCertifiableBadgeAcquisition.forPixEduFormationContinue1erDegreAvance = function (complementaryCertification) {
  return buildCertifiableBadgeAcquisition({
    badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE }),
    complementaryCertification,
  });
};

buildCertifiableBadgeAcquisition.forPixEduFormationContinue1erDegreConfirme = function (complementaryCertification) {
  return buildCertifiableBadgeAcquisition({
    badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME }),
    complementaryCertification,
  });
};

buildCertifiableBadgeAcquisition.forPixEduFormationInitiale1erDegreConfirme = function (complementaryCertification) {
  return buildCertifiableBadgeAcquisition({
    badge: buildBadge({ key: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME }),
    complementaryCertification,
  });
};

buildCertifiableBadgeAcquisition.forPixEduFormationInitiale1erDegreInitie = function (complementaryCertification) {
  return buildCertifiableBadgeAcquisition({
    badge: buildBadge({ key: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE }),
    complementaryCertification,
  });
};

buildCertifiableBadgeAcquisition.forPixDroitMaitre = function (complementaryCertification) {
  return buildCertifiableBadgeAcquisition({
    badge: buildBadge({ key: PIX_DROIT_MAITRE_CERTIF }),
    complementaryCertification,
  });
};

buildCertifiableBadgeAcquisition.forPixDroitExpert = function (complementaryCertification) {
  return buildCertifiableBadgeAcquisition({
    badge: buildBadge({ key: PIX_DROIT_EXPERT_CERTIF }),
    complementaryCertification,
  });
};

buildCertifiableBadgeAcquisition.forCleaV1 = function (complementaryCertification) {
  return buildCertifiableBadgeAcquisition({
    badge: buildBadge({ key: PIX_EMPLOI_CLEA_V1 }),
    complementaryCertification,
  });
};

buildCertifiableBadgeAcquisition.forCleaV2 = function (complementaryCertification) {
  return buildCertifiableBadgeAcquisition({
    badge: buildBadge({ key: PIX_EMPLOI_CLEA_V2 }),
    complementaryCertification,
  });
};

buildCertifiableBadgeAcquisition.forCleaV3 = function (complementaryCertification) {
  return buildCertifiableBadgeAcquisition({
    badge: buildBadge({ key: PIX_EMPLOI_CLEA_V3 }),
    complementaryCertification,
  });
};

module.exports = buildCertifiableBadgeAcquisition;
