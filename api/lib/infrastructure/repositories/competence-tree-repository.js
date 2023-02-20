import areaRepository from './area-repository';
import CompetenceTree from '../../domain/models/CompetenceTree';

export default {
  async get({ locale } = {}) {
    const areas = await areaRepository.listWithPixCompetencesOnly({ locale });
    return new CompetenceTree({ areas });
  },
};
