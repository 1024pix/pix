

type BannerArgs = { id: string, message: string, severity: string }
type InformationBannerArgs = { id: string, banners?: BannerArgs[] }

export class InformationBanner {
  id: string;
  banners: Banner[];

  constructor({ id, banners }: InformationBannerArgs) {
    this.id = id;
    this.banners = banners?.map((banner, index) => new Banner({ ...banner, id: `${id}:${index + 1}` })) || [];
  }

  static empty({ id }: Pick<InformationBannerArgs, 'id'>) {
    return new InformationBanner({ id });
  }
}

class Banner {
  id: string;
  message: string;
  severity: string;

  constructor({ id, message, severity }: BannerArgs) {
    this.id = id;
    this.message = message;
    this.severity = severity;
  }
}
