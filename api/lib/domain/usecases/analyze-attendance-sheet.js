module.exports = function analyzeAttendanceSheet({
  odsBuffer,
  certificationsOdsService,
}) {
  return certificationsOdsService
    .extractCertificationsDataFromAttendanceSheet({ odsBuffer });
};
