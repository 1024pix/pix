import { getI18n } from '../../../../../../../src/shared/infrastructure/i18n/i18n.js';

import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Read-models | Parcoursup | ParcoursupCertificationLevel', function () {
  let translate;

  beforeEach(function () {
    translate = getI18n().__;
  });

  describe('#getLevelLabel', function () {
    it('should return the label for LEVEL_BEGINNER_2', function () {
      // given
      const certificationLevel = domainBuilder.certification.results.parcoursup.buildParcoursupCertificationLevel({
        score: 128,
        maxReachableLevel: 7,
      });

      // when
      const translatedLabel = certificationLevel.getLevelLabel(translate);

      // then
      expect(translatedLabel).to.equal(translate('certification.global.meshlevel.LEVEL_BEGINNER_2.label'));
    });

    it('should return the label for LEVEL_EXPERT_7', function () {
      // given
      const certificationLevel = domainBuilder.certification.results.parcoursup.buildParcoursupCertificationLevel({
        score: 896,
        maxReachableLevel: 7,
      });

      // when
      const translatedLabel = certificationLevel.getLevelLabel(translate);

      // then
      expect(translatedLabel).to.equal(translate('certification.global.meshlevel.LEVEL_EXPERT_7.label'));
    });

    it('should return an empty string when there is no translation (LEVEL_PRE_BEGINNER)', function () {
      // given
      const certificationLevel = domainBuilder.certification.results.parcoursup.buildParcoursupCertificationLevel({
        score: 0,
        maxReachableLevel: 7,
      });

      // when
      const translatedLabel = certificationLevel.getLevelLabel(translate);

      // then
      expect(translatedLabel).to.equal('');
    });
  });
});
