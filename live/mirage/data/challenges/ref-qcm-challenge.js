// QCM challenge with all field filled
export default {
  data: {
    type: 'challenges',
    id: 'ref_qcm_challenge_id',
    attributes: {
      type: 'QCM',
      instruction: "Un QCM propose plusieurs choix, l\'utilisateur peut en choisir [plusieurs](http://link.plusieurs.url)",
      'attachment-url': 'http://example_of_url',
      'attachment-filename': 'example_of_filename.pdf',
      'illustration-url': 'http://fakeimg.pl/350x200/?text=PictureOfQCM',
      proposals: "- possibilite 1, et/ou" + 
              "\n - possibilite 2, et/ou" + 
              "\n - possibilite 3, et/ou " + 
              "\n - possibilite 4"
    }
  }
};
