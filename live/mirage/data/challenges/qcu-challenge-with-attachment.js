export default  {
  data: {
    type: 'challenges',
    id: 'qcu_challenge_with_attachment_id',
    attributes: {
      type: 'QCU',
      'attachment-url': 'http://example_of_url',
      'attachment-filename': 'example_of_filename.pdf',
      instruction: "Julie a déposé un document dans un espace de stockage partagé avec Pierre. Elle lui envoie un mail pour l’en informer. Quel est le meilleur message ?",
      proposals: "" +
      "- J’ai déposé le document ici : P: > Equipe > Communication > Textes > intro.odt\n " +
      "- Ci-joint le document que j’ai déposé dans l’espace partagé\n " +
      "- J’ai déposé le document intro.odt dans l’espace partagé\n" +
      "- J’ai déposé un nouveau document dans l’espace partagé, si tu ne le trouves pas je te l’enverrai par mail"
    }
  }
};
