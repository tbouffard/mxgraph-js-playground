import { mxgraph } from 'mxgraph';
import { MxGraphBpmnStyles } from './MxGraphBpmnStyles';
import { mxgraphFactory } from '../../../components/mxgraph-factory';

const { mxUtils, mxPoint } = mxgraphFactory({
  mxLoadResources: false,
  mxLoadStylesheets: false,
});

export const LANE_HEIGHT_LARGE = 220;
export const LANE_HEIGHT_LITTLE = 180;
export const LANE_WIDTH = 1500;

export const EVENT_WIDTH = 30;
export const EVENT_Y_LARGE = LANE_HEIGHT_LARGE / 2 - 10;
export const EVENT_Y_LITTLE = LANE_HEIGHT_LITTLE / 2 - 10;

export const TASK_WIDTH = 150;
export const TASK_HEIGHT = 75;
export const TASK_Y_LARGE = EVENT_Y_LARGE - 22;
export const TASK_Y_LITTLE = EVENT_Y_LITTLE - 22;

export default class MxGraphModelUpdater {
  constructor(readonly graph: mxgraph.mxGraph) {}

  public createPool(name: string, y = 0, width: number = LANE_WIDTH): mxgraph.mxCell {
    const pool = this.graph.insertVertex(this.graph.getDefaultParent(), null, name, 0, y, width, 0, MxGraphBpmnStyles.POLL_LANE);
    pool.setConnectable(false);
    return pool as mxgraph.mxCell;
  }

  public createLane(pool: mxgraph.mxCell, name: string, y = 0, height: number = LANE_HEIGHT_LARGE, width: number = LANE_WIDTH): mxgraph.mxCell {
    const lane = this.graph.insertVertex(pool, null, name, 0, y, width, height, MxGraphBpmnStyles.POLL_LANE);
    lane.setConnectable(false);
    return lane as mxgraph.mxCell;
  }

  public createStartEvent(lane: mxgraph.mxCell, y: number = EVENT_Y_LARGE, x = 60): mxgraph.mxCell {
    return this.graph.insertVertex(lane, null, null, x, y, EVENT_WIDTH, EVENT_WIDTH, MxGraphBpmnStyles.EVENT_START) as mxgraph.mxCell;
  }

  public createEndTerminateEvent(lane: mxgraph.mxCell, name: string, y: number = EVENT_Y_LARGE): mxgraph.mxCell {
    return this.graph.insertVertex(lane, null, name, LANE_WIDTH - 100, y, EVENT_WIDTH, EVENT_WIDTH, MxGraphBpmnStyles.EVENT_END_TERMINATE) as mxgraph.mxCell;
  }

  public createEndEvent(lane: mxgraph.mxCell, y: number = EVENT_Y_LARGE, x: number = LANE_WIDTH - 100, name?: string): mxgraph.mxCell {
    return this.graph.insertVertex(lane, null, name, x, y, EVENT_WIDTH, EVENT_WIDTH, MxGraphBpmnStyles.EVENT_END) as mxgraph.mxCell;
  }

  public createBoundaryEvent(task: mxgraph.mxCell, name: string, x: number, y: number): mxgraph.mxCell {
    const boundaryEvent = this.graph.insertVertex(task, null, name, x, y, 30, 25, MxGraphBpmnStyles.EVENT_BOUNDARY);
    boundaryEvent.geometry.offset = new mxPoint(-15, -10);
    boundaryEvent.geometry.relative = true;
    return boundaryEvent as mxgraph.mxCell;
  }

  public createTask(lane: mxgraph.mxCell, name: string, x: number, y: number = TASK_Y_LARGE): mxgraph.mxCell {
    return this.graph.insertVertex(lane, null, name, x, y, TASK_WIDTH, TASK_HEIGHT, MxGraphBpmnStyles.TASK) as mxgraph.mxCell;
  }

  public createCallActivity(
    lane: mxgraph.mxCell,
    name: string,
    x: number,
    y = TASK_Y_LARGE,
    href: string = null,
    modalId: string = null,
    subProcessId: string = null,
  ): mxgraph.mxCell {
    // Note that these XML nodes will be enclosing the mxCell nodes for the model cells in the output
    const doc = mxUtils.createXmlDocument();

    const callActivity = doc.createElement(MxGraphBpmnStyles.TASK_CA);
    callActivity.setAttribute('name', name);
    callActivity.setAttribute('href', href);
    callActivity.setAttribute('modalId', modalId);
    callActivity.setAttribute('subProcessId', subProcessId);

    return this.graph.insertVertex(lane, null, callActivity, x, y, TASK_WIDTH, TASK_HEIGHT, MxGraphBpmnStyles.TASK_CA) as mxgraph.mxCell;
  }

  public createCondition(lane: mxgraph.mxCell, name: string, x: number, y = TASK_Y_LARGE): mxgraph.mxCell {
    return this.graph.insertVertex(lane, null, name, x, y, TASK_HEIGHT, TASK_HEIGHT, MxGraphBpmnStyles.GATEWAY) as mxgraph.mxCell;
  }

  public createDefaultTransition(source: mxgraph.mxCell, target: mxgraph.mxCell, name = null, style?: string): mxgraph.mxEdge {
    return this.graph.insertEdge(this.graph.getDefaultParent(), null, name, source, target, style) as mxgraph.mxEdge;
  }

  public createDefaultTransitionWithPoint(source: mxgraph.mxCell, target: mxgraph.mxCell, name = null, style?: string): mxgraph.mxEdge {
    const transition = this.createDefaultTransition(source, target, name, style);
    transition.geometry.points = [new mxPoint(source.geometry.x + source.geometry.width / 2, target.geometry.y + target.geometry.height / 2)];
    return transition as mxgraph.mxEdge;
  }

  public createCrossoverTransition(source: mxgraph.mxCell, target: mxgraph.mxCell): mxgraph.mxEdge {
    return this.graph.insertEdge(this.graph.getDefaultParent(), null, null, source, target, MxGraphBpmnStyles.TRANSITION_CROSSOVER);
  }

  public createCrossoverTransitionWithPoint(source: mxgraph.mxCell, target: mxgraph.mxCell): mxgraph.mxEdge {
    const transition = this.createCrossoverTransition(source, target);
    transition.geometry.points = [new mxPoint(target.geometry.x + target.geometry.width / 2 + 20, source.geometry.y + (source.geometry.height * 4) / 5)];
    return transition as mxgraph.mxEdge;
  }

  public createAnimatedTransition(source: mxgraph.mxCell, target: mxgraph.mxCell) {
    return this.graph.insertEdge(this.graph.getDefaultParent(), null, null, source, target, MxGraphBpmnStyles.TRANSITION_ANIMATED);
  }

  public addAnimation(edgesWithTransition: mxgraph.mxCell[]) {
    // Adds animation to edge shape and makes "pipe" visible
    this.graph.orderCells(true, edgesWithTransition);
    edgesWithTransition.forEach(edge => {
      const state = this.graph.view.getState(edge);
      state.shape.node.getElementsByTagName('path')[0].removeAttribute('visibility');
      state.shape.node.getElementsByTagName('path')[0].setAttribute('stroke-width', '6');
      state.shape.node.getElementsByTagName('path')[0].setAttribute('stroke', 'LightPink');
      state.shape.node.getElementsByTagName('path')[1].setAttribute('class', 'flow');
    });
  }
}
