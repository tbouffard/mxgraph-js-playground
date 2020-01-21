export class TemplateService {
  private readonly message: string;

  constructor() {
    this.message = 'test after calling service';
  }

  public test() {
    return this.message;
  }

}
