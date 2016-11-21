// QCM challenge with all field filled
export default {
  data: {
    type: 'challenges',
    id: 'ref_qcu_challenge_id',
    attributes: {
      type: 'QCU',
      'illustration-url': 'http://fakeimg.pl/350x200/?text=QCU',
      'attachment-url': 'http://example_of_url',
      'attachment-filename': 'filename.pdf',
      instruction: "Un QCU propose plusieurs choix, l\'utilisateur peut en choisir [un seul](http://link.unseul.url)",
      proposals: "" +
      "- 1ere possibilite\n " +
      "- 2eme possibilite\n " +
      "- 3eme possibilite\n" +
      "- 4eme possibilite"
    }
  }
};
