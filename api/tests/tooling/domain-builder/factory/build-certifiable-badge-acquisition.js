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

const buildCertifiableBadgeAcquisition = function ({ id = 123, userId = 456, badge, complementaryCertification } = {}) {
  badge = badge || buildBadge({ id: 1234 });
  complementaryCertification = complementaryCertification || buildComplementaryCertification();
  return new CertifiableBadgeAcquisition({
    id,
    userId,
    badge,
    complementaryCertification,
  });
};

buildCertifiableBadgeAcquisition.forPixEduFormationContinue2ndDegreExpert = function () {
  return buildCertifiableBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT }) });
};

buildCertifiableBadgeAcquisition.forPixEduFormationContinue2ndDegreAvance = function () {
  return buildCertifiableBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE }) });
};

buildCertifiableBadgeAcquisition.forPixEduFormationContinue2ndDegreConfirme = function () {
  return buildCertifiableBadgeAcquisition({
    badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME }),
  });
};

buildCertifiableBadgeAcquisition.forPixEduFormationInitiale2ndDegreConfirme = function () {
  return buildCertifiableBadgeAcquisition({
    badge: buildBadge({ key: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME }),
  });
};

buildCertifiableBadgeAcquisition.forPixEduFormationInitiale2ndDegreInitie = function () {
  return buildCertifiableBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE }) });
};

buildCertifiableBadgeAcquisition.forPixEduFormationContinue1erDegreExpert = function () {
  return buildCertifiableBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT }) });
};

buildCertifiableBadgeAcquisition.forPixEduFormationContinue1erDegreAvance = function () {
  return buildCertifiableBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE }) });
};

buildCertifiableBadgeAcquisition.forPixEduFormationContinue1erDegreConfirme = function () {
  return buildCertifiableBadgeAcquisition({
    badge: buildBadge({ key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME }),
  });
};

buildCertifiableBadgeAcquisition.forPixEduFormationInitiale1erDegreConfirme = function () {
  return buildCertifiableBadgeAcquisition({
    badge: buildBadge({ key: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME }),
  });
};

buildCertifiableBadgeAcquisition.forPixEduFormationInitiale1erDegreInitie = function () {
  return buildCertifiableBadgeAcquisition({ badge: buildBadge({ key: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE }) });
};

buildCertifiableBadgeAcquisition.forPixDroitMaitre = function () {
  return buildCertifiableBadgeAcquisition({ badge: buildBadge({ key: PIX_DROIT_MAITRE_CERTIF }) });
};

buildCertifiableBadgeAcquisition.forPixDroitExpert = function () {
  return buildCertifiableBadgeAcquisition({ badge: buildBadge({ key: PIX_DROIT_EXPERT_CERTIF }) });
};

buildCertifiableBadgeAcquisition.forCleaV1 = function () {
  return buildCertifiableBadgeAcquisition({ badge: buildBadge({ key: PIX_EMPLOI_CLEA_V1 }) });
};

buildCertifiableBadgeAcquisition.forCleaV2 = function () {
  return buildCertifiableBadgeAcquisition({ badge: buildBadge({ key: PIX_EMPLOI_CLEA_V2 }) });
};

buildCertifiableBadgeAcquisition.forCleaV3 = function () {
  return buildCertifiableBadgeAcquisition({ badge: buildBadge({ key: PIX_EMPLOI_CLEA_V3 }) });
};

module.exports = buildCertifiableBadgeAcquisition;
