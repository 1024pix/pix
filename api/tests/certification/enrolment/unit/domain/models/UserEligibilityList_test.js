import { LABEL_FOR_CORE } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityCalculator.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Enrolment | Domain | Models | UserEligibilityList and UserEligibilities classes', function () {
  describe('UserEligibilityList', function () {
    context('#get coreEligibilityV2', function () {
      it('should return core eligibility v2 if any', function () {
        // given
        const userEligibilityList = domainBuilder.certification.enrolment.buildUserEligibilityList({
          eligibilities: [
            domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: false, isV2: false }),
          ],
          eligibilitiesV2: [
            domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true, isV2: true }),
          ],
        });

        // when
        const coreEligibilityV2 = userEligibilityList.coreEligibilityV2;

        // then
        expect(coreEligibilityV2.toDTO()).to.deep.equal({
          certification: LABEL_FOR_CORE,
          isCertifiable: true,
          isV2: true,
        });
      });
      it('should return null if none', function () {
        // given
        const userEligibilityList = domainBuilder.certification.enrolment.buildUserEligibilityList({
          eligibilities: [
            domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: false, isV2: false }),
          ],
          eligibilitiesV2: [],
        });

        // when
        const coreEligibilityV2 = userEligibilityList.coreEligibilityV2;

        // then
        expect(coreEligibilityV2).to.be.null;
      });
    });
    context('#get complementaryEligibilitiesV2', function () {
      it('should return complementary eligibilities v2 if any', function () {
        // given
        const userEligibilityList = domainBuilder.certification.enrolment.buildUserEligibilityList({
          eligibilities: [
            domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
              certification: 'maSuperComplémentaire',
              isCertifiable: true,
              complementaryCertificationBadgeId: 99,
              complementaryCertificationId: 88,
              campaignId: 77,
              badgeKey: 'maSuperClé',
              why: { isOutdated: true, isCoreCertifiable: true },
              info: { hasComplementaryCertificationForThisLevel: true, versionsBehind: 2000 },
            }),
          ],
          eligibilitiesV2: [
            domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true, isV2: true }),
            domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
              certification: 'maSuperComplémentaireV2_1',
              isCertifiable: true,
              complementaryCertificationBadgeId: 99,
              complementaryCertificationId: 88,
              campaignId: 77,
              badgeKey: 'maSuperCléV_1',
              why: { isOutdated: true, isCoreCertifiable: true },
              info: { hasComplementaryCertificationForThisLevel: true, versionsBehind: 2000 },
            }),
            domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
              certification: 'maSuperComplémentaireV2-2',
              isCertifiable: false,
              complementaryCertificationBadgeId: 11,
              complementaryCertificationId: 22,
              campaignId: 33,
              badgeKey: 'maSuperCléV2-2',
              why: { isOutdated: true, isCoreCertifiable: false },
              info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 0 },
            }),
          ],
        });

        // when
        const complementaryEligibilitiesV2 = userEligibilityList.complementaryEligibilitiesV2;

        // then
        expect(complementaryEligibilitiesV2.map((ce) => ce.toDTO())).to.deep.equal([
          {
            certification: 'maSuperComplémentaireV2_1',
            isCertifiable: true,
            isV2: true,
            complementaryCertificationBadgeId: 99,
            complementaryCertificationId: 88,
            campaignId: 77,
            badgeKey: 'maSuperCléV_1',
            why: { isOutdated: true, isCoreCertifiable: true },
            info: { hasComplementaryCertificationForThisLevel: true, versionsBehind: 2000 },
          },
          {
            certification: 'maSuperComplémentaireV2-2',
            isCertifiable: false,
            isV2: true,
            complementaryCertificationBadgeId: 11,
            complementaryCertificationId: 22,
            campaignId: 33,
            badgeKey: 'maSuperCléV2-2',
            why: { isOutdated: true, isCoreCertifiable: false },
            info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 0 },
          },
        ]);
      });
      it('should return empty array if none', function () {
        // given
        const userEligibilityList = domainBuilder.certification.enrolment.buildUserEligibilityList({
          eligibilities: [
            domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true, isV2: false }),
            domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
              certification: 'maSuperComplémentaireV2_1',
              isCertifiable: true,
              complementaryCertificationBadgeId: 99,
              complementaryCertificationId: 88,
              campaignId: 77,
              badgeKey: 'maSuperCléV_1',
              why: { isOutdated: true, isCoreCertifiable: true },
              info: { hasComplementaryCertificationForThisLevel: true, versionsBehind: 2000 },
            }),
          ],
          eligibilitiesV2: [
            domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true, isV2: true }),
          ],
        });

        // when
        const complementaryEligibilitiesV2 = userEligibilityList.complementaryEligibilitiesV2;

        // then
        expect(complementaryEligibilitiesV2).to.be.empty;
      });
    });
    context('#toDTO', function () {
      it('should return model as DTO', function () {
        // given
        const someDate = new Date('2020-01-01');
        const userEligibilityList = domainBuilder.certification.enrolment.buildUserEligibilityList({
          userId: 123,
          date: someDate,
          eligibilities: [
            domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true, isV2: false }),
          ],
          eligibilitiesV2: [
            domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true, isV2: true }),
          ],
        });

        // when
        const DTO = userEligibilityList.toDTO();

        // then
        expect(DTO).to.deep.equal({
          userId: 123,
          date: someDate,
          eligibilities: [{ certification: LABEL_FOR_CORE, isCertifiable: true, isV2: false }],
          eligibilitiesV2: [{ certification: LABEL_FOR_CORE, isCertifiable: true, isV2: true }],
        });
      });
    });
  });

  describe('UserCoreEligibility', function () {
    context('#get isCore', function () {
      it('should return true', function () {
        // given
        const coreEligibility = domainBuilder.certification.enrolment.buildUserCoreEligibility();

        // when
        const isCore = coreEligibility.isCore;

        // then
        expect(isCore).to.be.true;
      });
    });
    context('#get isCertifiable', function () {
      it('should return true when is certifiable', function () {
        // given
        const coreEligibility = domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true });

        // when
        const isCertifiable = coreEligibility.isCertifiable;

        // then
        expect(isCertifiable).to.be.true;
      });
      it('should return false when is not certifiable', function () {
        // given
        const coreEligibility = domainBuilder.certification.enrolment.buildUserCoreEligibility({
          isCertifiable: false,
        });

        // when
        const isCertifiable = coreEligibility.isCertifiable;

        // then
        expect(isCertifiable).to.be.false;
      });
    });
    context('#toDTO', function () {
      it('should return model as DTO', function () {
        // given
        const coreUserEligibility = domainBuilder.certification.enrolment.buildUserCoreEligibility({
          isCertifiable: true,
          isV2: false,
        });

        // when
        const DTO = coreUserEligibility.toDTO();

        // then
        expect(DTO).to.deep.equal({ certification: LABEL_FOR_CORE, isCertifiable: true, isV2: false });
      });
    });
  });

  describe('UserComplementaryEligibilityV2', function () {
    context('#get complementaryCertificationBadgeId', function () {
      it('should return complementaryCertificationBadgeId', function () {
        // given
        const complementaryEligibility = domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
          complementaryCertificationBadgeId: 123,
        });

        // when
        const complementaryCertificationBadgeId = complementaryEligibility.complementaryCertificationBadgeId;

        // then
        expect(complementaryCertificationBadgeId).to.equal(123);
      });
    });
    context('#get isOutdated', function () {
      it('should return isOutdated', function () {
        // given
        const complementaryEligibility = domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
          why: { isOutdated: true },
        });

        // when
        const isOutdated = complementaryEligibility.isOutdated;

        // then
        expect(isOutdated).to.be.true;
      });
    });
    context('#get hasComplementaryCertificationForThisLevel', function () {
      it('should return hasComplementaryCertificationForThisLevel', function () {
        // given
        const complementaryEligibility = domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
          info: { hasComplementaryCertificationForThisLevel: true },
        });

        // when
        const hasComplementaryCertificationForThisLevel =
          complementaryEligibility.hasComplementaryCertificationForThisLevel;

        // then
        expect(hasComplementaryCertificationForThisLevel).to.be.true;
      });
    });
    context('#estCertifiable', function () {
      it("doit retourner faux lorsque l'utilisateur n'est pas certifiable", function () {
        // given
        const complementaryEligibility = domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
          isCertifiable: false,
        });

        // when
        const res = complementaryEligibility.estCertifiable();

        // then
        expect(res).to.be.false;
      });

      it("doit retourner vrai lorsque l'utilisateur est certifiable", function () {
        /// given
        const complementaryEligibility = domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
          isCertifiable: true,
        });

        // when
        const res = complementaryEligibility.estCertifiable();

        // then
        expect(res).to.be.true;
      });
    });
    context('#estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard', function () {
      it("doit retourner faux lorsque l'utilisateur est certifiable", function () {
        // given
        const complementaryEligibility = domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
          isCertifiable: true,
          why: { isOutdated: false, isCoreCertifiable: true },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 0 },
        });

        // when
        const res = complementaryEligibility.estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard();

        // then
        expect(res).to.be.false;
      });

      it("doit retourner faux lorsque l'utilisateur n'est pas certifiable car il n'est pas certifiable pix", function () {
        // given
        const complementaryEligibility = domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
          isCertifiable: false,
          why: { isOutdated: false, isCoreCertifiable: false },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 0 },
        });

        // when
        const res = complementaryEligibility.estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard();

        // then
        expect(res).to.be.false;
      });

      it("doit retourner faux lorsque l'utilisateur n'est pas certifiable car il n'est ni certifiable pix ni ne possède un badge à jour, même d'une seule version de retard", function () {
        // given
        const complementaryEligibility = domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
          isCertifiable: false,
          why: { isOutdated: true, isCoreCertifiable: false },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 1 },
        });

        // when
        const res = complementaryEligibility.estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard();

        // then
        expect(res).to.be.false;
      });

      it("doit retourner faux lorsque l'utilisateur n'est pas certifiable car il ne possède un badge à jour, de plus d'une version de retard", function () {
        // given
        const complementaryEligibility = domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
          isCertifiable: false,
          why: { isOutdated: true, isCoreCertifiable: true },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 22 },
        });

        // when
        const res = complementaryEligibility.estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard();

        // then
        expect(res).to.be.false;
      });

      it("doit retourner vrai lorsque l'utilisateur n'est pas certifiable car il ne possède pas un badge à jour mais n'a qu'une seule version de retard", function () {
        // given
        const complementaryEligibility = domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
          isCertifiable: false,
          why: { isOutdated: true, isCoreCertifiable: true },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 1 },
        });

        // when
        const res = complementaryEligibility.estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard();

        // then
        expect(res).to.be.true;
      });
    });
    context('#estPasCertifiableCarLeBadgeEstPerimé', function () {
      it("doit retourner faux lorsque l'utilisateur est certifiable", function () {
        // given
        const complementaryEligibility = domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
          isCertifiable: true,
          why: { isOutdated: false, isCoreCertifiable: true },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 0 },
        });

        // when
        const res = complementaryEligibility.estPasCertifiableCarLeBadgeEstPerimé();

        // then
        expect(res).to.be.false;
      });

      it("doit retourner faux lorsque l'utilisateur n'est pas certifiable car il n'est pas certifiable pix", function () {
        // given
        const complementaryEligibility = domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
          isCertifiable: false,
          why: { isOutdated: false, isCoreCertifiable: false },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 0 },
        });

        // when
        const res = complementaryEligibility.estPasCertifiableCarLeBadgeEstPerimé();

        // then
        expect(res).to.be.false;
      });

      it("doit retourner faux lorsque l'utilisateur n'est pas certifiable car il n'est ni certifiable pix ni ne possède un badge à jour", function () {
        // given
        const complementaryEligibility = domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
          isCertifiable: false,
          why: { isOutdated: true, isCoreCertifiable: false },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 1 },
        });

        // when
        const res = complementaryEligibility.estPasCertifiableCarLeBadgeEstPerimé();

        // then
        expect(res).to.be.false;
      });

      it("doit retourner vrai lorsque l'utilisateur n'est pas certifiable car il ne possède un badge à jour", function () {
        // given
        const complementaryEligibility = domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
          isCertifiable: false,
          why: { isOutdated: true, isCoreCertifiable: true },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 22 },
        });

        // when
        const res = complementaryEligibility.estPasCertifiableCarLeBadgeEstPerimé();

        // then
        expect(res).to.be.true;
      });
    });
    context('#toDTO', function () {
      it('should return model as DTO', function () {
        // given
        const complementaryUserEligibilityV2 =
          domainBuilder.certification.enrolment.buildUserComplementaryEligibilityV2({
            certification: 'maSuperComplémentaire',
            isCertifiable: true,
            complementaryCertificationBadgeId: 99,
            complementaryCertificationId: 88,
            campaignId: 77,
            badgeKey: 'maSuperClé',
            why: { isOutdated: true, isCoreCertifiable: true },
            info: { hasComplementaryCertificationForThisLevel: true, versionsBehind: 2000 },
          });

        // when
        const DTO = complementaryUserEligibilityV2.toDTO();

        // then
        expect(DTO).to.deep.equal({
          certification: 'maSuperComplémentaire',
          isCertifiable: true,
          isV2: true,
          complementaryCertificationBadgeId: 99,
          complementaryCertificationId: 88,
          campaignId: 77,
          badgeKey: 'maSuperClé',
          why: { isOutdated: true, isCoreCertifiable: true },
          info: { hasComplementaryCertificationForThisLevel: true, versionsBehind: 2000 },
        });
      });
    });
  });
});
