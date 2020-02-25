// import AbstractGraph from "../AbstractGraph";

abstract class AbstractBpmnShape {
  private _x: number;
  private _y: number;
  private _height: number;
  private _width: number;
  private _label: string;
  private readonly _type: string; // TODO switch to enum

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get height(): number {
    return this._height;
  }

  get width(): number {
    return this._width;
  }

  get label(): string {
    return this._label;
  }

  get type(): string {
    return this._type;
  }

  protected constructor(x: number, y: number, height: number, width: number, label: string, type: string) {
    this._x = x;
    this._y = y;
    this._height = height;
    this._width = width;
    this._label = label;
    this._type = type;
  }
}

export class BpmnStartEvent extends AbstractBpmnShape {
  constructor(x: number, y: number, height: number, width: number, label: string) {
    super(x, y, height, width, label, 'StartEvent');
  }
}

export class BpmnEndEvent extends AbstractBpmnShape {
  constructor(x: number, y: number, height: number, width: number, label: string) {
    super(x, y, height, width, label, 'EndEvent');
  }
}

export class BpmnHumanTask extends AbstractBpmnShape {
  constructor(x: number, y: number, height: number, width: number, label: string) {
    super(x, y, height, width, label, 'HumanTask');
  }
}
