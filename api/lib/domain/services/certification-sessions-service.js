module.exports = {
  groupBySessions,
  associateSessionIdToParsedData,
};

function groupBySessions(data) {
  const groupedSessions = data.filter(
    (session, index, self) =>
      index ===
      self.findIndex(
        (currentSession) =>
          currentSession['* Nom du site'] === session['* Nom du site'] &&
          currentSession['* Nom de la salle'] === session['* Nom de la salle'] &&
          currentSession['* Date de début'] === session['* Date de début'] &&
          currentSession['* Heure de début (heure locale)'] === session['* Heure de début (heure locale)'] &&
          currentSession['* Surveillant(s)'] === session['* Surveillant(s)'] &&
          currentSession['Observations (optionnel)'] === session['Observations (optionnel)']
      )
  );

  return groupedSessions;
}

function associateSessionIdToParsedData(parsedCsvData, sessions) {
  const parsedDataWithSessionId = parsedCsvData.map((parsedCsvline) => {
    const matchedSession = sessions.find((session) => {
      return (
        parsedCsvline['* Nom du site'] === session.address &&
        parsedCsvline['* Nom de la salle'] === session.room &&
        parsedCsvline['* Date de début'] === session.date &&
        parsedCsvline['* Heure de début (heure locale)'] === session.time &&
        parsedCsvline['* Surveillant(s)'] === session.examiner &&
        parsedCsvline['Observations (optionnel)'] === session.description
      );
    });

    parsedCsvline.sessionId = matchedSession.id.toString();
    return parsedCsvline;
  });
  return parsedDataWithSessionId;
}
