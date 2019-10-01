module.exports = function parseCertificationsDataFromAttendanceSheet({
  odsBuffer,
  certificationsOdsService,
}) {
  return certificationsOdsService
    .extractCertificationsDataFromAttendanceSheet({ odsBuffer });
};
