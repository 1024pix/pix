function serializeHttpErrorResponse(response, customMessage) {
  let errorDetails;

  if (typeof response.data === 'string') {
    errorDetails = response.data.length > 0 ? response.data : 'Pas de détails disponibles';
  }

  if (typeof response.data === 'object') {
    errorDetails = JSON.stringify(response.data);
  }

  if (!customMessage) {
    return errorDetails;
  }

  const dataToLog = {
    customMessage,
    errorDetails,
  };

  return dataToLog;
}

export default {
  serializeHttpErrorResponse,
};
