// import AbstractGraph from "../AbstractGraph";

import { EVENT_Y_LARGE } from '../mxGraph/MxGraphModelUpdater';

abstract class AbstractBpmnShape {
  // type: string; // TODO switch to enum
  protected constructor(
    readonly id: string,
    readonly x: number,
    readonly y: number,
    readonly height: number,
    readonly width: number,
    // TODO label should be an object to manage bpmn bounds
    // <bpmndi:BPMNLabel>
    //   <dc:Bounds x="239" y="205" width="22" height="14" />
    // </bpmndi:BPMNLabel>
    readonly label: string,
    readonly type: string,
  ) {}
}

export class BpmnStartEvent extends AbstractBpmnShape {
  constructor(id: string, label: string, y: number, x: number) {
    super(id, x, y, -1, -1, label, 'StartEvent');
  }
}

export class BpmnTerminateEndEvent extends AbstractBpmnShape {
  constructor(id: string, label: string, y: number, x: number) {
    super(id, x, y, -1, -1, label, 'TerminateEndEvent');
  }
}

export class BpmnUserTask extends AbstractBpmnShape {
  constructor(id: string, label: string, x: number, y: number, height: number, width: number) {
    super(id, x, y, height, width, label, 'UserTask');
  }
}

export class BpmnServiceTask extends AbstractBpmnShape {
  constructor(id: string, label: string, x: number, y: number, height: number, width: number) {
    super(id, x, y, height, width, label, 'ServiceTask');
  }
}

export class BpmnParallelGateway extends AbstractBpmnShape {
  constructor(id: string, label: string, x: number, y: number, height: number, width: number) {
    super(id, x, y, height, width, label, 'ParallelGateway');
  }
}

export class BpmnLane extends AbstractBpmnShape {
  private readonly _elements = new Set<AbstractBpmnShape>();
  private readonly _edges = new Set<BpmnEdge>();

  constructor(id: string, label: string, y = 0, width: number, height: number) {
    super(id, -1, y, height, width, label, 'Lane');
  }

  get elements(): Set<AbstractBpmnShape> {
    return this._elements;
  }
  add(element: AbstractBpmnShape): void {
    this._elements.add(element);
  }
  get edges(): Set<BpmnEdge> {
    return this._edges;
  }
  addEdge(edge: BpmnEdge): void {
    this._edges.add(edge);
  }
}

// TODO type?
export class BpmnEdge {
  // <model:sequenceFlow id="_RLk_pXH_Eei9Z4IY4QeFuA" name="" sourceRef="_RLk-oHH_Eei9Z4IY4QeFuA" targetRef="_RLk_AXH_Eei9Z4IY4QeFuA"/>
  private readonly _wayPoints = new Set<BpmnWayPoint>();

  constructor(readonly id: string, readonly label: string, readonly sourceRefId: string, readonly targetRefId: string) {}

  // TODO way points
  addWayPoint(wayPoint: BpmnWayPoint) {
    this._wayPoints.add(wayPoint);
  }
  get wayPoints(): Set<BpmnWayPoint> {
    return this._wayPoints;
  }
}

// TODO inner class
export class BpmnWayPoint {
  //   <di_1:waypoint x="580.0" y="519.0"/>
  constructor(readonly x: number, readonly y: number) {}
}

export class BpmnProcess extends AbstractBpmnShape {
  constructor(id: string, label: string, x: number, y: number, height: number, width: number) {
    super(id, x, y, height, width, label, 'Process');
  }

  private readonly _lanes = new Set<BpmnLane>();
  private readonly _edges = new Set<BpmnEdge>();

  public addLane(lane: BpmnLane): void {
    this._lanes.add(lane);
  }
  get lanes(): Set<BpmnLane> {
    return this._lanes;
  }

  // TODO duplication with lanes, introduce a new 'Edges aware' type
  get edges(): Set<BpmnEdge> {
    return this._edges;
  }
  addEdge(edge: BpmnEdge): void {
    this._edges.add(edge);
  }
}
