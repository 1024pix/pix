import randomString from 'randomstring';

function generate(campaignRepository, pendingList = []) {
  const letters = randomString.generate({
    length: 6,
    charset: 'alphabetic',
    capitalization: 'uppercase',
    readable: true,
  });
  const numbers = randomString.generate({ length: 3, charset: 'numeric', readable: true });

  const generatedCampaignCode = letters.concat(numbers);

  if (pendingList.includes(generatedCampaignCode)) {
    return generate(campaignRepository, pendingList);
  }

  return campaignRepository.isCodeAvailable(generatedCampaignCode).then((isCodeAvailable) => {
    if (isCodeAvailable) {
      return Promise.resolve(generatedCampaignCode);
    }
    return generate(campaignRepository, pendingList);
  });
}

export default {
  generate,
};
