import * as poleEmploiService from '../services/pole-emploi-service.js';

const getPoleEmploiSendings = async function ({ cursor, poleEmploiSendingRepository, filters }) {
  const cursorData = await poleEmploiService.decodeCursor(cursor);
  const sendings = await poleEmploiSendingRepository.find(cursorData, filters);
  const link = _generateLink(sendings, filters);
  return { sendings, link };
};

export { getPoleEmploiSendings };

function _generateLink(sendings, filters) {
  if (!sendings.length) return null;

  const lastSending = sendings[sendings.length - 1];
  const link = poleEmploiService.generateLink(lastSending, filters);
  return link;
}
