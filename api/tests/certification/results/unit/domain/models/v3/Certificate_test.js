import { expect } from 'chai';

import { Certificate } from '../../../../../../../src/certification/results/domain/models/v3/Certificate.js';
import { CertificateMeshLevel } from '../../../../../../../src/certification/results/domain/models/v3/CertificateMeshLevel.js';
import { PIX_PLUS_EDU_EXTERNAL_LEVELS } from '../../../../../../../src/certification/shared/domain/constants/mesh-configuration.js';
import { Frameworks } from '../../../../../../../src/certification/shared/domain/models/Frameworks.js';

describe('Unit | Domain | Models | Certification | Results | Certificate v3', function () {
  describe('#resultCompetenceTree', function () {
    describe('when the scope is CORE and the level is pre-beginner', function () {
      it('should return the model with an empty competence tree array', function () {
        // given & when
        const certificate = new Certificate({
          id: 1,
          firstName: 'Jean',
          lastName: 'Bon',
          birthdate: '1992-06-12',
          birthplace: 'Paris',
          certificationCenter: 'L\u2019universit\u00e9 du Pix',
          deliveredAt: new Date('2025-10-30T01:02:03Z'),
          pixScore: 63,
          verificationCode: 'P-SOMECODE',
          resultCompetenceTree: [Symbol('competence')],
          reachedMeshIndex: 0,
          certificationFramework: Frameworks.CORE,
        });

        // then
        expect(certificate.resultCompetenceTree).to.be.null;
      });
    });
  });

  describe('#findLevel', function () {
    describe('when the level is CORE pre-beginner', function () {
      it('should return null', function () {
        // given & when
        const certificate = new Certificate({
          id: 1,
          firstName: 'Jean',
          lastName: 'Bon',
          birthdate: '1992-06-12',
          birthplace: 'Paris',
          certificationCenter: 'L\u2019universit\u00e9 du Pix',
          deliveredAt: new Date('2025-10-30T01:02:03Z'),
          pixScore: 63,
          verificationCode: 'P-SOMECODE',
          resultCompetenceTree: [Symbol('competence')],
          reachedMeshIndex: 0,
          certificationFramework: Frameworks.CORE,
        });

        // then
        expect(certificate.globalLevel).to.be.null;
      });
    });

    describe('when the level is not CORE pre-beginner', function () {
      it('should return the expected level', function () {
        // given & when
        const certificate = new Certificate({
          id: 1,
          firstName: 'Jean',
          lastName: 'Bon',
          birthdate: '1992-06-12',
          birthplace: 'Paris',
          certificationCenter: 'L\u2019universit\u00e9 du Pix',
          deliveredAt: new Date('2025-10-30T01:02:03Z'),
          pixScore: 63,
          verificationCode: 'P-SOMECODE',
          resultCompetenceTree: [Symbol('competence')],
          reachedMeshIndex: 1,
          certificationFramework: Frameworks.CORE,
        });

        // then
        expect(certificate.globalLevel).to.deepEqualInstance(
          new CertificateMeshLevel({ reachedMeshIndex: 1, certificationFramework: Frameworks.CORE }),
        );
      });
    });

    describe('when the framework is EDU with an external jury result', function () {
      it('should return the level based on the external jury result', function () {
        // given & when
        const certificate = new Certificate({
          id: 1,
          firstName: 'Jean',
          lastName: 'Bon',
          birthdate: '1992-06-12',
          birthplace: 'Paris',
          certificationCenter: 'L\u2019universit\u00e9 du Pix',
          deliveredAt: new Date('2025-10-30T01:02:03Z'),
          pixScore: 63,
          verificationCode: 'P-SOMECODE',
          resultCompetenceTree: [Symbol('competence')],
          reachedMeshIndex: 0,
          certificationFramework: Frameworks.EDU_2ND_DEGRE,
          eduV3ExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.ADVANCED,
        });

        // then
        expect(certificate.globalLevel).to.deepEqualInstance(
          new CertificateMeshLevel({
            reachedMeshIndex: 0,
            certificationFramework: Frameworks.EDU_2ND_DEGRE,
            eduV3ExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.ADVANCED,
          }),
        );
        expect(certificate.globalLevel.meshLevel).to.equal('LEVEL_ADVANCED');
      });

      it('should fall back to admissible level when external jury result is not set', function () {
        // given & when
        const certificate = new Certificate({
          id: 1,
          firstName: 'Jean',
          lastName: 'Bon',
          birthdate: '1992-06-12',
          birthplace: 'Paris',
          certificationCenter: 'L\u2019universit\u00e9 du Pix',
          deliveredAt: new Date('2025-10-30T01:02:03Z'),
          pixScore: 63,
          verificationCode: 'P-SOMECODE',
          resultCompetenceTree: [Symbol('competence')],
          reachedMeshIndex: 0,
          certificationFramework: Frameworks.EDU_1ER_DEGRE,
        });

        // then
        expect(certificate.globalLevel.meshLevel).to.equal('LEVEL_ADMISSIBLE');
      });
    });
  });
});
