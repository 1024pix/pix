module.exports = async function getPoleEmploiSendings({ poleEmploiSendingRepository }) {
  return await poleEmploiSendingRepository.get();
};
