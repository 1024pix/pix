import sinon from 'sinon';

import {
  CERTIFICATE_LABEL_CONTEXTS,
  CertificateMeshLevel,
  CORE_LEVELS,
  EDU_LEVELS,
} from '../../../../../../../src/certification/results/domain/models/v3/CertificateMeshLevel.js';
import { PIX_PLUS_EDU_EXTERNAL_LEVELS } from '../../../../../../../src/certification/shared/domain/constants/mesh-configuration.js';
import { Frameworks } from '../../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { config } from '../../../../../../../src/shared/config.js';
import { getI18n } from '../../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { expect } from '../../../../../../test-helper.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Models | CertificateMeshLevel', function () {
  let translate;

  beforeEach(function () {
    translate = getI18n().__;
  });

  describe('when the scope is CORE', function () {
    it('should return the corresponding mesh level', async function () {
      // when
      const globalCertificationLevel = new CertificateMeshLevel({
        reachedMeshIndex: 2,
        certificationFramework: Frameworks.CORE,
      });

      // then
      expect(globalCertificationLevel.meshLevel).to.equal(CORE_LEVELS['2']);
    });
  });

  describe('when the scope is EDU', function () {
    describe('when the reached mesh index is null', function () {
      it('should return a null mesh level', async function () {
        // when
        const globalCertificationLevel = new CertificateMeshLevel({
          reachedMeshIndex: null,
          certificationFramework: Frameworks.EDU_1ER_DEGRE,
        });

        // then
        expect(globalCertificationLevel.meshLevel).to.equal(null);
      });
    });

    describe('when the reached mesh index is at least O', function () {
      it('should return the corresponding mesh level', async function () {
        // when
        const globalCertificationLevel = new CertificateMeshLevel({
          reachedMeshIndex: 0,
          certificationFramework: Frameworks.EDU_CPE,
        });

        // then
        expect(globalCertificationLevel.meshLevel).to.equal(EDU_LEVELS['0']);
      });
    });

    describe('when the external jury result is set', function () {
      ['EDU_1ER_DEGRE', 'EDU_2ND_DEGRE', 'EDU_CPE'].forEach((eduFramework) => {
        context(`for framework ${eduFramework}`, function () {
          Object.values(PIX_PLUS_EDU_EXTERNAL_LEVELS).forEach((externalLevel) => {
            it(`should return LEVEL_${externalLevel} when eduV3ExternalJuryResult is ${externalLevel}`, function () {
              // when
              const globalCertificationLevel = new CertificateMeshLevel({
                reachedMeshIndex: 0,
                certificationFramework: Frameworks[eduFramework],
                eduV3ExternalJuryResult: externalLevel,
              });

              // then
              expect(globalCertificationLevel.meshLevel).to.equal(`LEVEL_${externalLevel}`);
            });
          });

          [null, undefined, 'UNSET'].forEach((eduV3ExternalJuryResult) => {
            it(`should fall back to LEVEL_ADMISSIBLE when eduV3ExternalJuryResult is ${eduV3ExternalJuryResult}`, function () {
              // when
              const globalCertificationLevel = new CertificateMeshLevel({
                reachedMeshIndex: 0,
                certificationFramework: Frameworks[eduFramework],
                eduV3ExternalJuryResult,
              });

              // then
              expect(globalCertificationLevel.meshLevel).to.equal('LEVEL_ADMISSIBLE');
            });
          });
        });
      });
    });
  });

  describe('#getLevelLabel', function () {
    context('when certificationFramework is CORE', function () {
      it('should return the label for LEVEL_BEGINNER_2', function () {
        // given
        const globalMeshLevel = domainBuilder.certification.results.buildCertificateMeshLevel({
          reachedMeshIndex: 2,
          certificationFramework: Frameworks.CORE,
        });

        // when
        const translatedLabel = globalMeshLevel.getLevelLabel(translate);

        // then
        expect(translatedLabel).to.equal(translate('certification.meshlevel.CORE.LEVEL_BEGINNER_2.label'));
      });

      it('should return the label for LEVEL_EXPERT_7', function () {
        // given
        const globalMeshLevel = domainBuilder.certification.results.buildCertificateMeshLevel({
          reachedMeshIndex: 7,
          certificationFramework: Frameworks.CORE,
        });

        // when
        const translatedLabel = globalMeshLevel.getLevelLabel(translate);

        // then
        expect(translatedLabel).to.equal(translate('certification.meshlevel.CORE.LEVEL_EXPERT_7.label'));
      });

      it('should return an empty string when there is no translation (LEVEL_PRE_BEGINNER)', function () {
        // given
        const globalMeshLevel = domainBuilder.certification.results.buildCertificateMeshLevel({
          reachedMeshIndex: 0,
          certificationFramework: Frameworks.CORE,
        });

        // when
        const translatedLabel = globalMeshLevel.getLevelLabel(translate);

        // then
        expect(translatedLabel).to.equal('');
      });
    });

    context('when certificationFramework is CLEA', function () {
      it('should return the same label as CORE for LEVEL_BEGINNER_2', function () {
        // given
        const globalMeshLevel = domainBuilder.certification.results.buildCertificateMeshLevel({
          reachedMeshIndex: 2,
          certificationFramework: Frameworks.CLEA,
        });

        // when
        const translatedLabel = globalMeshLevel.getLevelLabel(translate);

        // then
        expect(translatedLabel).to.equal(translate('certification.meshlevel.CORE.LEVEL_BEGINNER_2.label'));
      });
    });

    context('when certificationFramework is EDU', function () {
      it('should return the label for LEVEL_ADMISSIBLE', function () {
        // given
        const globalMeshLevel = domainBuilder.certification.results.buildCertificateMeshLevel({
          reachedMeshIndex: 0,
          certificationFramework: Frameworks.EDU_1ER_DEGRE,
        });

        // when
        const translatedLabel = globalMeshLevel.getLevelLabel(translate);

        // then
        expect(translatedLabel).to.equal(translate('certification.meshlevel.EDU_1ER_DEGRE.LEVEL_ADMISSIBLE.label'));
      });
    });
  });

  describe('#getSummaryLabel', function () {
    context('when certificationFramework is CORE', function () {
      it('should return the user summary for LEVEL_BEGINNER_2', function () {
        // given
        const globalMeshLevel = domainBuilder.certification.results.buildCertificateMeshLevel({
          reachedMeshIndex: 2,
          certificationFramework: Frameworks.CORE,
        });

        // when
        const translatedLabel = globalMeshLevel.getSummaryLabel(translate, CERTIFICATE_LABEL_CONTEXTS.USER);

        // then
        expect(translatedLabel).to.equal(translate('certification.meshlevel.CORE.LEVEL_BEGINNER_2.summary.user'));
      });

      it('should return the shareable summary for LEVEL_BEGINNER_2', function () {
        // given
        const globalMeshLevel = domainBuilder.certification.results.buildCertificateMeshLevel({
          reachedMeshIndex: 2,
          certificationFramework: Frameworks.CORE,
        });

        // when
        const translatedLabel = globalMeshLevel.getSummaryLabel(translate, CERTIFICATE_LABEL_CONTEXTS.SHAREABLE);

        // then
        expect(translatedLabel).to.equal(translate('certification.meshlevel.CORE.LEVEL_BEGINNER_2.summary.shareable'));
      });
    });

    context('when certificationFramework is EDU', function () {
      it('should return the user summary for LEVEL_ADMISSIBLE', function () {
        // given
        const globalMeshLevel = domainBuilder.certification.results.buildCertificateMeshLevel({
          reachedMeshIndex: 0,
          certificationFramework: Frameworks.EDU_1ER_DEGRE,
        });

        // when
        const translatedLabel = globalMeshLevel.getSummaryLabel(translate, CERTIFICATE_LABEL_CONTEXTS.USER);

        // then
        expect(translatedLabel).to.equal(
          translate('certification.meshlevel.EDU_1ER_DEGRE.LEVEL_ADMISSIBLE.summary.user'),
        );
      });

      it('should return the shareable summary for LEVEL_ADMISSIBLE', function () {
        // given
        const globalMeshLevel = domainBuilder.certification.results.buildCertificateMeshLevel({
          reachedMeshIndex: 0,
          certificationFramework: Frameworks.EDU_1ER_DEGRE,
        });

        // when
        const translatedLabel = globalMeshLevel.getSummaryLabel(translate, CERTIFICATE_LABEL_CONTEXTS.SHAREABLE);

        // then
        expect(translatedLabel).to.equal(
          translate('certification.meshlevel.EDU_1ER_DEGRE.LEVEL_ADMISSIBLE.summary.shareable'),
        );
      });
    });

    context('when certificationFramework is a Pix+ standard framework', function () {
      it('should return the user summary for LEVEL_ADVANCED', function () {
        // given
        const globalMeshLevel = domainBuilder.certification.results.buildCertificateMeshLevel({
          reachedMeshIndex: 2,
          certificationFramework: Frameworks.DROIT,
        });

        // when
        const translatedLabel = globalMeshLevel.getSummaryLabel(translate, CERTIFICATE_LABEL_CONTEXTS.USER);

        // then
        expect(translatedLabel).to.equal(translate('certification.meshlevel.DROIT.LEVEL_ADVANCED.summary.user'));
      });

      it('should return the shareable summary for LEVEL_ADVANCED', function () {
        // given
        const globalMeshLevel = domainBuilder.certification.results.buildCertificateMeshLevel({
          reachedMeshIndex: 2,
          certificationFramework: Frameworks.DROIT,
        });

        // when
        const translatedLabel = globalMeshLevel.getSummaryLabel(translate, CERTIFICATE_LABEL_CONTEXTS.SHAREABLE);

        // then
        expect(translatedLabel).to.equal(translate('certification.meshlevel.DROIT.LEVEL_ADVANCED.summary.shareable'));
      });
    });
  });

  describe('#getDescriptionLabel', function () {
    context('when certificationFramework is CORE', function () {
      it('should return the user description for LEVEL_BEGINNER_2', function () {
        // given
        const globalMeshLevel = domainBuilder.certification.results.buildCertificateMeshLevel({
          reachedMeshIndex: 2,
          certificationFramework: Frameworks.CORE,
        });

        // when
        const translatedLabel = globalMeshLevel.getDescriptionLabel(translate, CERTIFICATE_LABEL_CONTEXTS.USER);

        // then
        expect(translatedLabel).to.equal(translate('certification.meshlevel.CORE.LEVEL_BEGINNER_2.description.user'));
      });

      it('should return the shareable description for LEVEL_BEGINNER_2', function () {
        // given
        const globalMeshLevel = domainBuilder.certification.results.buildCertificateMeshLevel({
          reachedMeshIndex: 2,
          certificationFramework: Frameworks.CORE,
        });

        // when
        const translatedLabel = globalMeshLevel.getDescriptionLabel(translate, CERTIFICATE_LABEL_CONTEXTS.SHAREABLE);

        // then
        expect(translatedLabel).to.equal(
          translate('certification.meshlevel.CORE.LEVEL_BEGINNER_2.description.shareable'),
        );
      });
    });

    context('when certificationFramework is EDU', function () {
      it('should return the user description for LEVEL_ADMISSIBLE', function () {
        // given
        const globalMeshLevel = domainBuilder.certification.results.buildCertificateMeshLevel({
          reachedMeshIndex: 0,
          certificationFramework: Frameworks.EDU_CPE,
        });

        // when
        const translatedLabel = globalMeshLevel.getDescriptionLabel(translate, CERTIFICATE_LABEL_CONTEXTS.USER);

        // then
        expect(translatedLabel).to.equal(
          translate('certification.meshlevel.EDU_CPE.LEVEL_ADMISSIBLE.description.user'),
        );
      });

      it('should return the shareable description for LEVEL_ADMISSIBLE', function () {
        // given
        const globalMeshLevel = domainBuilder.certification.results.buildCertificateMeshLevel({
          reachedMeshIndex: 0,
          certificationFramework: Frameworks.EDU_CPE,
        });

        // when
        const translatedLabel = globalMeshLevel.getDescriptionLabel(translate, CERTIFICATE_LABEL_CONTEXTS.SHAREABLE);

        // then
        expect(translatedLabel).to.equal(
          translate('certification.meshlevel.EDU_CPE.LEVEL_ADMISSIBLE.description.shareable'),
        );
      });
    });

    context('when certificationFramework is a Pix+ standard framework', function () {
      it('should return the user description for LEVEL_ADVANCED', function () {
        // given
        const globalMeshLevel = domainBuilder.certification.results.buildCertificateMeshLevel({
          reachedMeshIndex: 2,
          certificationFramework: Frameworks.DROIT,
        });

        // when
        const translatedLabel = globalMeshLevel.getDescriptionLabel(translate, CERTIFICATE_LABEL_CONTEXTS.USER);

        // then
        expect(translatedLabel).to.equal(translate('certification.meshlevel.DROIT.LEVEL_ADVANCED.description.user'));
      });

      it('should return the shareable description for LEVEL_ADVANCED', function () {
        // given
        const globalMeshLevel = domainBuilder.certification.results.buildCertificateMeshLevel({
          reachedMeshIndex: 2,
          certificationFramework: Frameworks.DROIT,
        });

        // when
        const translatedLabel = globalMeshLevel.getDescriptionLabel(translate, CERTIFICATE_LABEL_CONTEXTS.SHAREABLE);

        // then
        expect(translatedLabel).to.equal(
          translate('certification.meshlevel.DROIT.LEVEL_ADVANCED.description.shareable'),
        );
      });
    });
  });

  describe('#badgeUrl', function () {
    context('when the framework is CORE', function () {
      it('should return null', function () {
        // given
        const meshLevel = new CertificateMeshLevel({
          reachedMeshIndex: 1,
          certificationFramework: Frameworks.CORE,
        });

        // then
        expect(meshLevel.badgeUrl).to.be.null;
      });
    });

    context('when the framework is CLEA', function () {
      it('should return null', function () {
        // given
        const meshLevel = new CertificateMeshLevel({
          reachedMeshIndex: 1,
          certificationFramework: Frameworks.CLEA,
        });

        // then
        expect(meshLevel.badgeUrl).to.be.null;
      });
    });

    context('when the meshLevel is null', function () {
      it('should return null', function () {
        // given
        const meshLevel = new CertificateMeshLevel({
          reachedMeshIndex: null,
          certificationFramework: Frameworks.DROIT,
        });

        // then
        expect(meshLevel.badgeUrl).to.be.null;
      });
    });

    context('when the meshLevel is LEVEL_ADMISSIBLE', function () {
      it('should return null', function () {
        // given
        const meshLevel = new CertificateMeshLevel({
          reachedMeshIndex: 0,
          certificationFramework: Frameworks.EDU_1ER_DEGRE,
        });

        // then
        expect(meshLevel.badgeUrl).to.be.null;
      });
    });

    context('when the framework is a Pix+ with a valid level', function () {
      it('should return the badge URL', function () {
        // given
        sinon.stub(config.assetsManager, 'url').value('https://super-assert-url.org');

        // when
        const meshLevel = new CertificateMeshLevel({
          reachedMeshIndex: 2,
          certificationFramework: Frameworks.DROIT,
        });

        // then
        expect(meshLevel.badgeUrl).to.equal('https://super-assert-url.org/badges-certifies/v3/droit/advanced.png');
      });
    });

    context('when the framework is EDU with an external jury result', function () {
      it('should return the badge URL', function () {
        // given
        sinon.stub(config.assetsManager, 'url').value('https://super-assert-url.org');

        // when
        const meshLevel = new CertificateMeshLevel({
          reachedMeshIndex: 0,
          certificationFramework: Frameworks.EDU_2ND_DEGRE,
          eduV3ExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.ADVANCED,
        });

        // then
        expect(meshLevel.badgeUrl).to.equal(
          'https://super-assert-url.org/badges-certifies/v3/edu_2nd_degre/advanced.png',
        );
      });
    });
  });
});
