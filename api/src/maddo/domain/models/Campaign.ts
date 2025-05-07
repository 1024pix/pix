interface Tubes {
  id: number;
  name: string;
  competenceId: string;
  maxLevel: number;
  meanLevel: number;
  practicalDescription: string;
  practicalTitle: string;
}

export class Campaign {
  private id: number;
  private name: string;
  private type: string;
  private targetProfileName: string;
  private code: string;
  private createdAt: Date;
  private tubes?: Tubes[];

  constructor({
    id,
    name,
    type,
    targetProfileName,
    code,
    createdAt,
    tubes,
  }: {
    id: number;
    name: string;
    type: string;
    targetProfileName: string;
    code: string;
    createdAt: Date;
    tubes?: Tubes[];
  }) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.targetProfileName = targetProfileName;
    this.code = code;
    this.createdAt = createdAt;
    this.tubes = tubes;
  }
}
