module.exports = async function getCpfCertificationResults({ startDate, endDate, cpfCertificationResultRepository }) {
  return cpfCertificationResultRepository.findByTimeRange({ startDate, endDate });
};
