export default function (schema, request) {
  request.params.tutorialId;
  const tutorialId = request.params.tutorialId;
  const tutorial = schema.tutorials.find(tutorialId);
  return tutorial.userTutorial.destroy();
}
