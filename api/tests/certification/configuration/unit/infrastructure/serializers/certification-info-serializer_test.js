import { expect } from 'chai';

import { certificationInfoSerializer } from '../../../../../../src/certification/configuration/infrastructure/serializers/certification-info-serializer.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Certification | Configuration | Serializer | certification-info-serializer', function () {
  describe('#serialize', function () {
    it('should serialize certification info', function () {
      // given
      const certificationInfo = domainBuilder.certification.configuration.buildCertificationInfo({
        framework: Frameworks.EDU_2ND_DEGRE,
        startDate: new Date('2021-01-01'),
        expirationDate: null,
        assessmentDuration: 33,
        minimumAssessmentLength: 11,
        maximumAssessmentLength: 22,
      });

      // when
      const serialized = certificationInfoSerializer.serialize(certificationInfo);

      // then
      expect(serialized).to.deep.equal({
        data: {
          type: 'certification-infos',
          id: Frameworks.EDU_2ND_DEGRE,
          attributes: {
            'assessment-duration': 33,
            'minimum-assessment-length': 11,
            'maximum-assessment-length': 22,
          },
        },
      });
    });
  });
});
