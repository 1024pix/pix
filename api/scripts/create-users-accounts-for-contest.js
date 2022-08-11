const { parseCsvWithHeader } = require('./helpers/csvHelpers');
const bluebird = require('bluebird');
const userToCreateRepository = require('../lib/infrastructure/repositories/user-to-create-repository');
const authenticationMethodRepository = require('../lib/infrastructure/repositories/authentication-method-repository');
const userService = require('../lib/domain/services/user-service');
const encryptionService = require('../lib/domain/services/encryption-service');

function prepareDataForInsert(rawUsers) {
  return rawUsers.map(({ firstName, lastName, email, password }) => {
    return {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
    };
  });
}

async function createUsers({ usersInRaw }) {
  const now = new Date();
  await bluebird.mapSeries(usersInRaw, async (userDTO) => {
    const userToCreate = {
      firstName: userDTO.firstName,
      lastName: userDTO.lastName,
      email: userDTO.email,
      createAt: now,
      updatedAt: now,
      cgu: true,
      lang: 'fr',
    };
    const hashedPassword = await encryptionService.hashPassword(userDTO.password);

    await userService.createUserWithPassword({
      user: userToCreate,
      hashedPassword,
      userToCreateRepository,
      authenticationMethodRepository,
    });
  });
}

async function main() {
  console.log('Starting creating users accounts for contest.');

  try {
    const filePath = process.argv[2];

    console.log('Reading and parsing csv data file... ');
    const csvData = await parseCsvWithHeader(filePath);
    console.log('ok');

    console.log('Preparing data... ');
    const usersInRaw = prepareDataForInsert(csvData);
    console.log('ok');

    console.log('Creating users...');
    await createUsers({ usersInRaw });
    console.log('\nDone.');
  } catch (error) {
    console.error('\n', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (error) => {
      console.error(error);
      process.exit(1);
    }
  );
}

module.exports = {
  prepareDataForInsert,
  createUsers,
};
