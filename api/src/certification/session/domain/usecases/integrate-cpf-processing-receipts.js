const integrateCpfProccessingReceipts = async function ({ cpfReceiptsStorage }) {
  return cpfReceiptsStorage.findAll();
};

export { integrateCpfProccessingReceipts };
