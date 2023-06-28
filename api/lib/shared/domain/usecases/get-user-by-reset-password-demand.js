const getUserByResetPasswordDemand = async function ({
  temporaryKey,
  resetPasswordService,
  tokenService,
  userRepository,
  resetPasswordDemandRepository,
}) {
  await tokenService.decodeIfValid(temporaryKey);
  const { email } = await resetPasswordService.verifyDemand(temporaryKey, resetPasswordDemandRepository);
  return userRepository.getByEmail(email);
};

export { getUserByResetPasswordDemand };
