const poleEmploiService = require('../services/pole-emploi-service.js');

module.exports = async function getPoleEmploiSendings({ cursor, poleEmploiSendingRepository, filters }) {
  const cursorData = await poleEmploiService.decodeCursor(cursor);
  const sendings = await poleEmploiSendingRepository.find(cursorData, filters);
  const link = _generateLink(sendings, filters);
  return { sendings, link };
};

function _generateLink(sendings, filters) {
  if (!sendings.length) return null;

  const lastSending = sendings[sendings.length - 1];
  const link = poleEmploiService.generateLink(lastSending, filters);
  return link;
}
