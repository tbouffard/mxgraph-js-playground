import { mxgraph } from 'mxgraph';
import MxGraphModelUpdater from '../mxGraph/MxGraphModelUpdater';
import { BpmnHumanTask, BpmnProcess, BpmnStartEvent, BpmnTerminateEndEvent } from './BpmnModel';

export default class ModelConvertor {
  constructor(readonly graph: mxgraph.mxGraph, readonly mxGraphModelUpdater: MxGraphModelUpdater) {}

  updateMxGraphModel(process: BpmnProcess): void {
    const model = this.graph.getModel();
    // Adds cells to the model in a single task
    model.beginUpdate();
    try {
      this.doMxgraphModelUpdate(process);
    } finally {
      // Updates the display
      model.endUpdate();
    }
  }

  private doMxgraphModelUpdate(process: BpmnProcess): void {
    const pool = this.mxGraphModelUpdater.createPool(process.name, 0, 350, 200);

    const bpmnLane = process.lane;
    if (bpmnLane != null) {
      console.debug('found bpmn lane');
      console.debug(bpmnLane);
      const lane = this.mxGraphModelUpdater.createLane(pool, bpmnLane.label, bpmnLane.y, bpmnLane.height, bpmnLane.width);
      console.debug('Build elements of the lane');
      bpmnLane.elements.forEach(element => {
        console.log(element);
        if (element instanceof BpmnStartEvent) {
          this.mxGraphModelUpdater.createStartEvent(lane, element.y, element.x, element.label);
        } else if (element instanceof BpmnTerminateEndEvent) {
          this.mxGraphModelUpdater.createEndTerminateEvent(lane, element.label, element.y, element.x);
        } else if (element instanceof BpmnHumanTask) {
          this.mxGraphModelUpdater.createTask(lane, element.label, element.x, element.y, element.width, element.height);
        }
      });
    }
  }
}
