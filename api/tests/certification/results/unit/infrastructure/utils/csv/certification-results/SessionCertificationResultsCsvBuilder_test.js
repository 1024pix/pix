import { CertificationResult } from '../../../../../../../../src/certification/results/domain/models/CertificationResult.js';
import { SessionCertificationResultsCsvBuilder } from '../../../../../../../../src/certification/results/infrastructure/utils/csv/certification-results/SessionCertificationResultsCsvBuilder.js';
import { Frameworks } from '../../../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { getI18n } from '../../../../../../../../src/shared/infrastructure/i18n/i18n.js';

describe('Unit | infrastructure | utils | csv | certification-results | SessionCertificationResultsCsvBuilder', function () {
  describe('#showCompetencesColumns', function () {
    it('return true when one certif is on core framework', function () {
      const i18n = getI18n();
      const certificationResults = [
        new CertificationResult({ framework: Frameworks.CORE }),
        new CertificationResult({ framework: Frameworks.DROIT }),
      ];
      const sessionCertificationResultsCsvBuilder = new SessionCertificationResultsCsvBuilder({
        i18n,
        certificationResults,
      });
      expect(sessionCertificationResultsCsvBuilder.showCompetencesColumns()).to.be.true;
    });

    it('return true when one certif is on Clea framework', function () {
      const i18n = getI18n();
      const certificationResults = [
        new CertificationResult({ framework: Frameworks.CLEA }),
        new CertificationResult({ framework: Frameworks.DROIT }),
      ];
      const sessionCertificationResultsCsvBuilder = new SessionCertificationResultsCsvBuilder({
        i18n,
        certificationResults,
      });
      expect(sessionCertificationResultsCsvBuilder.showCompetencesColumns()).to.be.true;
    });

    it('return false when none certif is on core framework', function () {
      const i18n = getI18n();
      const certificationResults = [
        new CertificationResult({ framework: Frameworks.SANTE }),
        new CertificationResult({ framework: Frameworks.DROIT }),
      ];
      const sessionCertificationResultsCsvBuilder = new SessionCertificationResultsCsvBuilder({
        i18n,
        certificationResults,
      });
      expect(sessionCertificationResultsCsvBuilder.showCompetencesColumns()).to.be.false;
    });
  });
});
