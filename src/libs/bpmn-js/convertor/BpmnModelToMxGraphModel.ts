import { mxgraph } from 'mxgraph';
import MxGraphModelUpdater from '../mxGraph/MxGraphModelUpdater';
import {
  BpmnUserTask,
  BpmnProcess,
  BpmnStartEvent,
  BpmnTerminateEndEvent,
  BpmnParallelGateway,
  BpmnServiceTask
} from '../model/BpmnModel';

export default class ModelConvertor {
  constructor(readonly graph: mxgraph.mxGraph, readonly mxGraphModelUpdater: MxGraphModelUpdater) {}

  updateMxGraphModel(process: BpmnProcess): void {
    const t0 = new Date().getTime();
    const model = this.graph.getModel();
    // Adds cells to the model in a single task
    model.beginUpdate();
    try {
      this.doMxgraphModelUpdate(process);
    } finally {
      // Updates the display
      model.endUpdate();
    }
    console.info('BpmnProcess to mxGraph Model TRANSACTION DONE: ', new Date().getTime() - t0);
  }

  private doMxgraphModelUpdate(process: BpmnProcess): void {
    const t0 = new Date().getTime();
    this.mxGraphModelUpdater.createPoolWithId(process);
    console.info('mxGraph Model POOL CREATED: ', new Date().getTime() - t0);

    process.lanes.forEach(lane => {
      // console.debug('Build lane');
      // console.debug(lane);
      const laneId = lane.id;
      this.mxGraphModelUpdater.createLaneWithId(process.id, lane);
      console.info('mxGraph Model LANE CREATED: ', new Date().getTime() - t0);
      // console.debug('Build elements of the lane');
      lane.elements.forEach(element => {
        // console.debug(element);
        if (element instanceof BpmnStartEvent) {
          this.mxGraphModelUpdater.createStartEventWithId(laneId, element);
        } else if (element instanceof BpmnTerminateEndEvent) {
          this.mxGraphModelUpdater.createEndTerminateEventWithId(laneId, element);
        } else if (element instanceof BpmnUserTask) {
          this.mxGraphModelUpdater.createUserTask(laneId, element);
        } else if (element instanceof BpmnServiceTask) {
          this.mxGraphModelUpdater.createServiceTask(laneId, element);
        } else if (element instanceof BpmnParallelGateway) {
          this.mxGraphModelUpdater.createParallelGateway(laneId, element);
        }
      });
      console.info('mxGraph Model LANE ELEMENTS CREATED: ', new Date().getTime() - t0);
      // console.debug('Build edges of the lane');
      lane.edges.forEach(edge => {
        // console.debug(edge);
        this.mxGraphModelUpdater.createSimpleTransition(laneId, edge);
      });
      console.info('mxGraph Model LANE EDGES CREATED: ', new Date().getTime() - t0);
    });

    // console.debug('Build inter lane edges');
    process.edges.forEach(edge => {
      // console.debug(edge);
      this.mxGraphModelUpdater.createSimpleTransition(process.id, edge);
    });
    console.info('mxGraph Model INTER LANE EDGES DONE: ', new Date().getTime() - t0);
    console.info('mxGraph Model TRANSFORMATION DONE: ', new Date().getTime() - t0);
  }
}
