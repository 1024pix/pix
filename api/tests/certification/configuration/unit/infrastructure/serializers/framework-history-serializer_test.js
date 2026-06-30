import { VERSION_STATUSES } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import { FrameworkHistoryEntry } from '../../../../../../src/certification/configuration/domain/read-models/FrameworkHistoryEntry.js';
import * as serializer from '../../../../../../src/certification/configuration/infrastructure/serializers/framework-history-serializer.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../../../test-helper.js';

describe('Certification | Configuration | Unit | Serializer | framework-history-serializer', function () {
  describe('#serialize', function () {
    it('should serialize a framework history to JSONAPI', function () {
      // given
      const frameworkHistory = [
        new FrameworkHistoryEntry({
          id: 456,
          startDate: new Date('2024-01-01'),
          expirationDate: new Date('2025-02-02'),
          assessmentDuration: 90,
          maximumAssessmentLength: 32,
          status: VERSION_STATUSES.ARCHIVED,
        }),
      ];
      const scope = SCOPES.PIX_PLUS_DROIT;

      // when
      const serializedFrameworkHistory = serializer.serialize({ scope, frameworkHistory });

      // then
      expect(serializedFrameworkHistory).to.deep.equal({
        data: {
          attributes: {
            scope: SCOPES.PIX_PLUS_DROIT,
            history: frameworkHistory,
          },
          id: SCOPES.PIX_PLUS_DROIT,
          type: 'framework-histories',
        },
      });
    });
  });
});
