module.exports = {
  groupBySessions,
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
