module.exports = function getUserCurrentCertificationProfile(
  {
    userId,
    userService,
  }) {
  const now = new Date();
  return userService.getCertificationProfile({ userId, limitDate: now });
};
