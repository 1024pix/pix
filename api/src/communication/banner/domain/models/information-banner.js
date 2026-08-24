export class InformationBanner {
  constructor({ id, banners }) {
    this.id = id;
    this.banners =
      banners?.map((banner, index) => {
        return new Banner({ ...banner, id: `${id}:${index + 1}` });
      }) ?? [];
  }

  static empty({ id }) {
    return new InformationBanner({ id });
  }
}

class Banner {
  constructor({ id, message, severity }) {
    this.id = id;
    this.message = message;
    this.severity = severity;
  }
}
