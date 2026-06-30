import { analysisByTubesSerializer } from '../../../../../../../src/prescription/organization-learner/infrastructure/serializers/jsonapi/analysis-by-tubes-serializer.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | analysis-by-tubes-serializer', function () {
  describe('#serialize', function () {
    it('should convert an analysis-by-tubes object into JSON API data', function () {
      // given
      const analysisByTubes = {
        data: [
          {
            extraction_date: '2025-05-04',
            domaine: '2. Communication et collaboration',
            competence_code: '2.1',
            competence: 'Interagir',
            sujet: 'Messageries instantanées',
            niveau_par_user: '2.3809523809523810',
            niveau_par_sujet: '3.0000000000000000',
            couverture: '0.79365079365079366667',
          },
        ],
      };
      const expectedType = 'analysis-by-tubes';
      const expectedData = [
        {
          extraction_date: '2025-05-04',
          domaine: '2. Communication et collaboration',
          competence_code: '2.1',
          competence: 'Interagir',
          sujet: 'Messageries instantanées',
          niveau_par_user: '2.4',
          niveau_par_sujet: '3.0',
          couverture: '0.79365079365079366667',
        },
      ];

      // when
      const json = analysisByTubesSerializer.serialize(analysisByTubes);

      // then
      expect(json.data.type).to.equal(expectedType);
      expect(json.data.attributes.data).to.deep.equal(expectedData);
      expect(json.data.id).to.exist;
    });
  });
});
