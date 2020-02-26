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
      const laneId = bpmnLane.id;
      this.mxGraphModelUpdater.createLaneWithId(pool, bpmnLane);
      console.debug('Build elements of the lane');
      bpmnLane.elements.forEach(element => {
        console.log(element);
        if (element instanceof BpmnStartEvent) {
          this.mxGraphModelUpdater.createStartEventWithId(laneId, element);
        } else if (element instanceof BpmnTerminateEndEvent) {
          this.mxGraphModelUpdater.createEndTerminateEventWithId(laneId, element);
        } else if (element instanceof BpmnHumanTask) {
          this.mxGraphModelUpdater.createHumanTask(laneId, element);
        }
      });
      console.debug('Build edges of the lane');
      bpmnLane.edges.forEach(edge => {
        console.debug(edge);
        this.mxGraphModelUpdater.createSimpleTransition(laneId, edge);
      });
    }
  }
}
