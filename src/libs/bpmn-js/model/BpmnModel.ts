// import AbstractGraph from "../AbstractGraph";

import { EVENT_Y_LARGE, LANE_WIDTH } from '../mxGraph/MxGraphModelUpdater';

abstract class AbstractBpmnShape {
  // type: string; // TODO switch to enum
  protected constructor(readonly x: number, readonly y: number, readonly height: number, readonly width: number, readonly label: string, readonly type: string) {}
}

export class BpmnStartEvent extends AbstractBpmnShape {
  // constructor(x: number, y: number, height: number, width: number, label: string) {
  //   super(x, y, height, width, label, 'StartEvent');
  // }

  constructor(label: string, y = EVENT_Y_LARGE, x = 60) {
    super(x, y, -1, -1, label, 'StartEvent');
  }
}

export class BpmnTerminateEndEvent extends AbstractBpmnShape {
  // constructor(x: number, y: number, height: number, width: number, label: string) {
  //   super(x, y, height, width, label, 'TerminateEndEvent');
  // }

  constructor(label: string, y = EVENT_Y_LARGE, x: number) {
    super(x, y, -1, -1, label, 'TerminateEndEvent');
  }
}

export class BpmnHumanTask extends AbstractBpmnShape {
  constructor(label: string, x: number, y: number, height: number, width: number) {
    super(x, y, height, width, label, 'HumanTask');
  }
}

export class BpmnLane extends AbstractBpmnShape {
  private readonly _elements = new Set<AbstractBpmnShape>();
  // constructor(x: number, y: number, height: number, width: number, label: string) {
  //   super(x, y, height, width, label, 'Lane');
  // }

  constructor(label: string, y = 0, width: number, height: number) {
    super(-1, y, height, width, label, 'Lane');
  }

  get elements(): Set<AbstractBpmnShape> {
    return this._elements;
  }
  add(element: AbstractBpmnShape): void {
    this._elements.add(element);
  }
}

export class BpmnProcess {
  private _lane: BpmnLane;

  constructor(readonly name: string) {}

  get lane(): BpmnLane {
    return this._lane;
  }

  set lane(value: BpmnLane) {
    this._lane = value;
  }
}

// export class BpmnModel {
//   private _shapes = new Set<AbstractBpmnShape>();
//
//   get shapes(): Set<AbstractBpmnShape> {
//     return this._shapes;
//   }
//   add(shape: AbstractBpmnShape): void {
//     this._shapes.add(shape);
//   }
// }
