import * as injectedAnalysisRepository from '../../infrastructure/repositories/analysis-repository.js';
const getAnalysisByTubes = async function ({ organizationId, analysisRepository = injectedAnalysisRepository } = {}) {
  return analysisRepository.findByTubes({ organizationId });
};

export { getAnalysisByTubes };
