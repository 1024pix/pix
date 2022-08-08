module.exports = async function findUserForOidcReconciliation({
  email,
  password,
  pixAuthenticationService,
  userRepository,
}) {
  await pixAuthenticationService.getUserByUsernameAndPassword({
    username: email,
    password,
    userRepository,
  });
};
