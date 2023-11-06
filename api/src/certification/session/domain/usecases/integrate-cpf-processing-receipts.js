const integrateCpfProccessingReceipts = async function ({ cpfReceiptsStorage }) {
  // TODO: integration test with nock
  await cpfReceiptsStorage.findAll();
};

export { integrateCpfProccessingReceipts };
