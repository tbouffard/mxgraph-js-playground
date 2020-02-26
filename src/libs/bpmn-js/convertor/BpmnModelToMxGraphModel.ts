import { mxgraph } from 'mxgraph';
import MxGraphModelUpdater from '../mxGraph/MxGraphModelUpdater';
import {
  BpmnUserTask,
  BpmnProcess,
  BpmnStartEvent,
  BpmnTerminateEndEvent,
  BpmnParallelGateway
} from '../model/BpmnModel';

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
    this.mxGraphModelUpdater.createPoolWithId(process);


    process.lanes.forEach(lane => {
      console.debug('Build lane');
      console.debug(lane);
      const laneId = lane.id;
      this.mxGraphModelUpdater.createLaneWithId(process.id, lane);
      console.debug('Build elements of the lane');
      lane.elements.forEach(element => {
        console.log(element);
        if (element instanceof BpmnStartEvent) {
          this.mxGraphModelUpdater.createStartEventWithId(laneId, element);
        } else if (element instanceof BpmnTerminateEndEvent) {
          this.mxGraphModelUpdater.createEndTerminateEventWithId(laneId, element);
        } else if (element instanceof BpmnUserTask) {
          this.mxGraphModelUpdater.createUserTask(laneId, element);
        } else if (element instanceof BpmnParallelGateway) {
          this.mxGraphModelUpdater.createParallelGateway(laneId, element);
        }
      });
      console.debug('Build edges of the lane');
      lane.edges.forEach(edge => {
        console.debug(edge);
        this.mxGraphModelUpdater.createSimpleTransition(laneId, edge);
      });
    });
  }
}
