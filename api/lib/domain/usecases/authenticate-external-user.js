// TODO: export to AuthenticationMethod entity OR tokenService OR Token entity (better)
// TODO: replace in existing code (3 occurences)
const {
  MissingOrInvalidCredentialsError,
  UserNotFoundError,
  PasswordNotMatching,
  UserShouldChangePasswordError,
} = require('../errors');

const TOKEN_SOURCE_FOR_GAR = 'external';

async function authenticateExternalUser({
  username,
  password,
  tokenService,
  authenticationService,
  userRepository,
}) {

  try {
    const foundUser = await authenticationService.getUserByUsernameAndPassword({
      username,
      password,
      userRepository,
    });

    if (foundUser.shouldChangePassword) {
      // todo : add gar authentication method
      throw new UserShouldChangePasswordError();
    }

    return tokenService.createAccessTokenFromUser(foundUser.id, TOKEN_SOURCE_FOR_GAR);

  } catch (error) {
    if ((error instanceof UserNotFoundError) || (error instanceof PasswordNotMatching)) {
      throw new MissingOrInvalidCredentialsError();
    } else {
      throw (error);
    }
  }
}

module.exports = authenticateExternalUser;
