import * as serializer from '../../../../../../src/certification/configuration/infrastructure/serializers/consolidated-framework-serializer.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Unit | Serializer | consolidated-framework-serializer', function () {
  describe('#serialize', function () {
    it('should serialize a framework to JSONAPI', function () {
      // given
      const versionId = 123;
      const scope = ComplementaryCertificationKeys.PIX_PLUS_DROIT;
      const area = domainBuilder.buildArea({
        competences: [domainBuilder.buildCompetence({ tubes: [domainBuilder.buildTube()] })],
      });

      const consolidatedFramework = {
        scope,
        versionId,
        areas: [area],
      };

      // when
      const serializedConsolidatedFramework = serializer.serialize(consolidatedFramework);

      // then
      expect(serializedConsolidatedFramework).to.deep.equal({
        data: {
          attributes: {
            'complementary-certification-key': scope,
            version: String(versionId),
          },
          id: scope,
          relationships: {
            areas: {
              data: [
                {
                  id: 'recArea123',
                  type: 'areas',
                },
              ],
            },
          },
          type: 'certification-consolidated-frameworks',
        },
        included: [
          {
            attributes: {
              index: '1.1',
              name: 'Manger des fruits',
            },
            id: 'recCOMP1',
            type: 'competences',
          },
          {
            attributes: {
              code: '5',
              color: 'red',
              'framework-id': 'recFmk123',
              title: 'Super domaine',
            },
            id: 'recArea123',
            relationships: {
              competences: {
                data: [
                  {
                    id: 'recCOMP1',
                    type: 'competences',
                  },
                ],
              },
            },
            type: 'areas',
          },
        ],
      });
    });
  });
});
