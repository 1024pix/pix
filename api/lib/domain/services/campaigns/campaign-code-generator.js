const randomString = require('randomstring');
const { NotFoundError } = require('../../errors');

function generate(campaignRepository) {
  const letters = randomString.generate({ length: 6, charset: 'alphabetic', capitalization: 'uppercase', readable: true });
  const numbers = randomString.generate({ length: 3, charset: 'numeric', readable: true });

  const generatedCampaignCode = letters.concat(numbers);

  return campaignRepository.getByCode(generatedCampaignCode)
    .then(() =>  generate(campaignRepository))
    .catch((err) => {
      if (err instanceof NotFoundError) {
        return generatedCampaignCode;
      }
      throw err;
    });
}

module.exports = {
  generate,
};
