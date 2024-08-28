import { LABEL_FOR_CORE } from '../../../../../../src/certification/enrolment/domain/models/UserCertificabilityCalculator.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Enrolment | Domain | Models | UserCertificability', function () {
  context('#getCoreCertificability', function () {
    context('v2', function () {
      it('should return certificability core item copy with version added in it', function () {
        // given
        const userCertificability = domainBuilder.certification.enrolment.buildUserCertificability({
          certificability: [],
          certificabilityV2: [{ certification: LABEL_FOR_CORE, isCertifiable: true }, { certification: 'comp1' }],
        });

        // when
        const coreCertificability = userCertificability.getCoreCertificability({ v2: true });

        // then
        expect(coreCertificability).to.deep.equal({ certification: LABEL_FOR_CORE, isCertifiable: true, isV2: true });
      });
    });
    context('v3', function () {
      it('should return certificability core item copy with version added in it', function () {
        // given
        const userCertificability = domainBuilder.certification.enrolment.buildUserCertificability({
          certificability: [{ certification: LABEL_FOR_CORE, isCertifiable: true }, { certification: 'comp1' }],
          certificabilityV2: [],
        });

        // when
        const coreCertificability = userCertificability.getCoreCertificability();

        // then
        expect(coreCertificability).to.deep.equal({ certification: LABEL_FOR_CORE, isCertifiable: true, isV2: false });
      });
    });
  });
  context('#getComplementaryCertificabilities', function () {
    context('v2', function () {
      it('should return certificability items copies that are not core, along with version', function () {
        // given
        const userCertificability = domainBuilder.certification.enrolment.buildUserCertificability({
          certificability: [{ certification: LABEL_FOR_CORE, isCertifiable: true }],
          certificabilityV2: [
            { certification: LABEL_FOR_CORE, isCertifiable: true },
            { certification: 'comp1' },
            { certification: 'comp2' },
          ],
        });

        // when
        const complementaryCertificabilities = userCertificability.getComplementaryCertificabilities({ v2: true });

        // then
        expect(complementaryCertificabilities).to.deep.equal([
          { certification: 'comp1', isV2: true },
          { certification: 'comp2', isV2: true },
        ]);
      });
      it('should return an empty array if none', function () {
        // given
        const userCertificability = domainBuilder.certification.enrolment.buildUserCertificability({
          certificability: [{ certification: LABEL_FOR_CORE, isCertifiable: true }, { certification: 'comp1' }],
          certificabilityV2: [{ certification: LABEL_FOR_CORE, isCertifiable: true }],
        });

        // when
        const complementaryCertificabilities = userCertificability.getComplementaryCertificabilities({ v2: true });

        // then
        expect(complementaryCertificabilities).to.be.empty;
      });
    });
    context('v3', function () {
      it('should return certificability items copies that are not core, along with version', function () {
        // given
        const userCertificability = domainBuilder.certification.enrolment.buildUserCertificability({
          certificability: [
            { certification: LABEL_FOR_CORE, isCertifiable: true },
            { certification: 'comp1' },
            { certification: 'comp2' },
          ],
          certificabilityV2: [{ certification: LABEL_FOR_CORE, isCertifiable: true }],
        });

        // when
        const complementaryCertificabilities = userCertificability.getComplementaryCertificabilities();

        // then
        expect(complementaryCertificabilities).to.deep.equal([
          { certification: 'comp1', isV2: false },
          { certification: 'comp2', isV2: false },
        ]);
      });
      it('should return an empty array if none', function () {
        // given
        const userCertificability = domainBuilder.certification.enrolment.buildUserCertificability({
          certificability: [{ certification: LABEL_FOR_CORE, isCertifiable: true }],
          certificabilityV2: [{ certification: LABEL_FOR_CORE, isCertifiable: true }, { certification: 'comp1' }],
        });

        // when
        const complementaryCertificabilities = userCertificability.getComplementaryCertificabilities();

        // then
        expect(complementaryCertificabilities).to.be.empty;
      });
    });
  });
  context('#estCertifiableEtNaPasObtenuDeCertification', function () {
    it("doit retourner faux lorsque l'utilisateur n'est pas certifiable, même si il a obtenu une certification", function () {
      // étant donné
      const uneCertificabilité = {
        certification: 'uneComplémentaire',
        isCertifiable: false,
        info: { hasComplementaryCertificationForThisLevel: true },
      };
      const certificabilitésUtilisateur = domainBuilder.certification.enrolment.buildUserCertificability();

      // lorsque
      const res = certificabilitésUtilisateur.estCertifiableEtNaPasObtenuDeCertification(uneCertificabilité);

      // alors
      expect(res).to.be.false;
    });

    it("doit retourner faux lorsque l'utilisateur n'est pas certifiable et n'a pas obtenu de certification non plus", function () {
      // étant donné
      const uneCertificabilité = {
        certification: 'uneComplémentaire',
        isCertifiable: false,
        info: { hasComplementaryCertificationForThisLevel: false },
      };
      const certificabilitésUtilisateur = domainBuilder.certification.enrolment.buildUserCertificability();

      // lorsque
      const res = certificabilitésUtilisateur.estCertifiableEtNaPasObtenuDeCertification(uneCertificabilité);

      // alors
      expect(res).to.be.false;
    });

    it("doit retourner faux lorsque l'utilisateur est certifiable et a obtenu une certification", function () {
      // étant donné
      const uneCertificabilité = {
        certification: 'uneComplémentaire',
        isCertifiable: true,
        info: { hasComplementaryCertificationForThisLevel: true },
      };
      const certificabilitésUtilisateur = domainBuilder.certification.enrolment.buildUserCertificability();

      // lorsque
      const res = certificabilitésUtilisateur.estCertifiableEtNaPasObtenuDeCertification(uneCertificabilité);

      // alors
      expect(res).to.be.false;
    });

    it("doit retourner vrai lorsque l'utilisateur est certifiable mais n'a pas obtenu de certification", function () {
      // étant donné
      const uneCertificabilité = {
        certification: 'uneComplémentaire',
        isCertifiable: true,
        info: { hasComplementaryCertificationForThisLevel: false },
      };
      const certificabilitésUtilisateur = domainBuilder.certification.enrolment.buildUserCertificability();

      // lorsque
      const res = certificabilitésUtilisateur.estCertifiableEtNaPasObtenuDeCertification(uneCertificabilité);

      // alors
      expect(res).to.be.true;
    });
  });
  context('#estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard', function () {
    context('v2', function () {
      it("doit retourner faux lorsque l'utilisateur est certifiable", function () {
        // étant donné
        const uneCertificabilité = {
          certification: 'uneComplémentaire',
          isCertifiable: true,
          why: { isOutdated: false, isCoreCertifiable: true },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 0 },
          isV2: true,
        };
        const certificabilitésUtilisateur = domainBuilder.certification.enrolment.buildUserCertificability();

        // lorsque
        const res =
          certificabilitésUtilisateur.estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard(
            uneCertificabilité,
          );

        // alors
        expect(res).to.be.false;
      });

      it("doit retourner faux lorsque l'utilisateur est n'est pas certifiable car il n'est pas certifiable pix", function () {
        // étant donné
        const uneCertificabilité = {
          certification: 'uneComplémentaire',
          isCertifiable: false,
          why: { isOutdated: false, isCoreCertifiable: false },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 0 },
          isV2: true,
        };
        const certificabilitésUtilisateur = domainBuilder.certification.enrolment.buildUserCertificability();

        // lorsque
        const res =
          certificabilitésUtilisateur.estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard(
            uneCertificabilité,
          );

        // alors
        expect(res).to.be.false;
      });

      it("doit retourner faux lorsque l'utilisateur est n'est pas certifiable car il n'est ni certifiable pix ni possède un badge à jour, même d'une seule version de retard", function () {
        // étant donné
        const uneCertificabilité = {
          certification: 'uneComplémentaire',
          isCertifiable: false,
          why: { isOutdated: true, isCoreCertifiable: false },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 1 },
          isV2: true,
        };
        const certificabilitésUtilisateur = domainBuilder.certification.enrolment.buildUserCertificability();

        // lorsque
        const res =
          certificabilitésUtilisateur.estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard(
            uneCertificabilité,
          );

        // alors
        expect(res).to.be.false;
      });

      it("doit retourner faux lorsque l'utilisateur est n'est pas certifiable car il ne possède un badge à jour, de plus d'une version de retard", function () {
        // étant donné
        const uneCertificabilité = {
          certification: 'uneComplémentaire',
          isCertifiable: false,
          why: { isOutdated: true, isCoreCertifiable: true },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 2 },
          isV2: true,
        };
        const certificabilitésUtilisateur = domainBuilder.certification.enrolment.buildUserCertificability();

        // lorsque
        const res =
          certificabilitésUtilisateur.estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard(
            uneCertificabilité,
          );

        // alors
        expect(res).to.be.false;
      });

      it("doit retourner vrai lorsque l'utilisateur est n'est pas certifiable car il ne possède pas un badge à jour mais n'a qu'une seule version de retard", function () {
        // étant donné
        const uneCertificabilité = {
          certification: 'uneComplémentaire',
          isCertifiable: false,
          why: { isOutdated: true, isCoreCertifiable: true },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 1 },
          isV2: true,
        };
        const certificabilitésUtilisateur = domainBuilder.certification.enrolment.buildUserCertificability();

        // lorsque
        const res =
          certificabilitésUtilisateur.estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard(
            uneCertificabilité,
          );

        // alors
        expect(res).to.be.true;
      });
    });
    context('v3', function () {
      it("doit retourner faux lorsque l'utilisateur est certifiable", function () {
        // étant donné
        const uneCertificabilité = {
          certification: 'uneComplémentaire',
          isCertifiable: true,
          why: {
            isOutdated: false,
            hasObtainedCoreCertification: true,
            hasMinimumRequiredScoreForComplementaryCertification: true,
          },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 0 },
        };
        const certificabilitésUtilisateur = domainBuilder.certification.enrolment.buildUserCertificability();

        // lorsque
        const res =
          certificabilitésUtilisateur.estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard(
            uneCertificabilité,
          );

        // alors
        expect(res).to.be.false;
      });

      it("doit retourner faux lorsque l'utilisateur est n'est pas certifiable car il n'a pas de certification pix", function () {
        // étant donné
        const uneCertificabilité = {
          certification: 'uneComplémentaire',
          isCertifiable: false,
          why: {
            isOutdated: false,
            hasObtainedCoreCertification: false,
            hasMinimumRequiredScoreForComplementaryCertification: false,
          },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 0 },
        };
        const certificabilitésUtilisateur = domainBuilder.certification.enrolment.buildUserCertificability();

        // lorsque
        const res =
          certificabilitésUtilisateur.estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard(
            uneCertificabilité,
          );

        // alors
        expect(res).to.be.false;
      });

      it("doit retourner faux lorsque l'utilisateur est n'est pas certifiable car sa certification pix n'a pas un score assez élevé", function () {
        // étant donné
        const uneCertificabilité = {
          certification: 'uneComplémentaire',
          isCertifiable: false,
          why: {
            isOutdated: false,
            hasObtainedCoreCertification: true,
            hasMinimumRequiredScoreForComplementaryCertification: false,
          },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 0 },
        };
        const certificabilitésUtilisateur = domainBuilder.certification.enrolment.buildUserCertificability();

        // lorsque
        const res =
          certificabilitésUtilisateur.estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard(
            uneCertificabilité,
          );

        // alors
        expect(res).to.be.false;
      });

      it("doit retourner faux lorsque l'utilisateur est n'est pas certifiable car son badge est périmé (même d'une seule version de retard) et les conditions nécessaires côté certification pix ne sont pas remplies", function () {
        // étant donné
        const uneCertificabilité = {
          certification: 'uneComplémentaire',
          isCertifiable: false,
          why: {
            isOutdated: true,
            hasObtainedCoreCertification: true,
            hasMinimumRequiredScoreForComplementaryCertification: false,
          },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 1 },
        };
        const certificabilitésUtilisateur = domainBuilder.certification.enrolment.buildUserCertificability();

        // lorsque
        const res =
          certificabilitésUtilisateur.estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard(
            uneCertificabilité,
          );

        // alors
        expect(res).to.be.false;
      });

      it("doit retourner faux lorsque l'utilisateur est n'est pas certifiable car son badge est périmé de plus d'une version de retard", function () {
        // étant donné
        const uneCertificabilité = {
          certification: 'uneComplémentaire',
          isCertifiable: false,
          why: {
            isOutdated: true,
            hasObtainedCoreCertification: true,
            hasMinimumRequiredScoreForComplementaryCertification: true,
          },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 2 },
        };
        const certificabilitésUtilisateur = domainBuilder.certification.enrolment.buildUserCertificability();

        // lorsque
        const res =
          certificabilitésUtilisateur.estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard(
            uneCertificabilité,
          );

        // alors
        expect(res).to.be.false;
      });

      it("doit retourner vrai lorsque l'utilisateur est n'est pas certifiable car son badge est périmé mais que d'une seule version de retard", function () {
        // étant donné
        const uneCertificabilité = {
          certification: 'uneComplémentaire',
          isCertifiable: false,
          why: {
            isOutdated: true,
            hasObtainedCoreCertification: true,
            hasMinimumRequiredScoreForComplementaryCertification: true,
          },
          info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 1 },
        };
        const certificabilitésUtilisateur = domainBuilder.certification.enrolment.buildUserCertificability();

        // lorsque
        const res =
          certificabilitésUtilisateur.estPasCertifiableCarLeBadgeEstPeriméMaisQueDuneSeuleVersionDeRetard(
            uneCertificabilité,
          );

        // alors
        expect(res).to.be.true;
      });
    });
  });
});
