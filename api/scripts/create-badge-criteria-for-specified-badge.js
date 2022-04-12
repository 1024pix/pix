('use strict');
const { NotFoundError } = require('../lib/domain/errors');
const badgeRepository = require('../lib/infrastructure/repositories/badge-repository');

async function main() {
  console.log('Starting creating badge');

  const filePath = process.argv[2];

  console.log('Reading json data file... ');
  const jsonFile = require(filePath);
  console.log('ok');

  await checkBadgeExistence(jsonFile.badgeId);
}

async function checkBadgeExistence(badgeId) {
  try {
    await badgeRepository.get(badgeId);
  } catch (error) {
    throw new NotFoundError(`Badge ${badgeId} not found`);
  }
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
}

module.exports = { checkBadgeExistence };
