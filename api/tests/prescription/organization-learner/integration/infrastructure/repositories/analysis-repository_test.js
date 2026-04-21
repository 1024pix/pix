import * as analysisRepository from '../../../../../../src/prescription/organization-learner/infrastructure/repositories/analysis-repository.js';

import { datamartBuilder } from '../../../../../tooling/databases.js';

describe('Integration | Infrastructure | Repository | Analysis', function () {
  describe('#findByTubes', function () {
    it('should return cover rate analysis', async function () {
      // given
      const campaignInfo = {
        campaign_id: 456,
        target_profile_id: 123,
        orga_id: 111,
      };

      datamartBuilder.factory.buildOrganizationsCoverRates({
        ...campaignInfo,
        tag_name: 'TAG',
        domain_name: '1 domain',
        competence_code: '1.1',
        competence_name: 'competence 1',
        tube_id: 'tube1',
        tube_practical_title: 'tubeTitle 1',
        extraction_date: '2025-01-01',
        max_level: 5,
        sum_user_max_level: 2,
        passage_count: 2,
        nb_tubes_in_competence: 1,
      });
      datamartBuilder.factory.buildOrganizationsCoverRates({
        ...campaignInfo,
        tag_name: 'TAG',
        domain_name: '2 domain',
        competence_code: '2.2',
        competence_name: 'competence 2',
        tube_id: 'tube2',
        tube_practical_title: 'tubeTitle 2',
        extraction_date: '2025-01-01',
        max_level: 7,
        sum_user_max_level: 6,
        passage_count: 2,
        nb_tubes_in_competence: 1,
      });

      datamartBuilder.factory.buildOrganizationsCoverRates({
        campaign_id: 456,
        target_profile_id: 123,
        orga_id: 999,
        tag_name: 'TAG',
        domain_name: '1 domain',
        competence_code: '1.1',
        competence_name: 'competence 1',
        tube_id: 'tube1',
        tube_practical_title: 'tubeTitle 1',
        extraction_date: '2025-01-01',
        max_level: 5,
        sum_user_max_level: 2,
        passage_count: 2,
        nb_tubes_in_competence: 1,
      });

      await datamartBuilder.commit();

      // when
      const result = await analysisRepository.findByTubes({ organizationId: 111 });

      // then
      const expectedResult = [
        {
          competence: 'competence 2',
          competence_code: '2.2',
          couverture: '0.42857142857142857143',
          domaine: '2 domain',
          extraction_date: '2025-01-01',
          niveau_par_sujet: '7.0000000000000000',
          niveau_par_user: '3.0000000000000000',
          sujet: 'tubeTitle 2',
        },
        {
          competence: 'competence 1',
          competence_code: '1.1',
          couverture: '0.20000000000000000000',
          domaine: '1 domain',
          extraction_date: '2025-01-01',
          niveau_par_sujet: '5.0000000000000000',
          niveau_par_user: '1.00000000000000000000',
          sujet: 'tubeTitle 1',
        },
      ];

      expect(result).to.deep.equal(expectedResult);
    });
  });
});
