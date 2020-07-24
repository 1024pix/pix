const statsTableSizeProbeRepository = require('../../repositories/stats-table-size-probe-repository');

function collectDatabaseStatistics() {
  return statsTableSizeProbeRepository.collect();
}

module.exports = collectDatabaseStatistics;
