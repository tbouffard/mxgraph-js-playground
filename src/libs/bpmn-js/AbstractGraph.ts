import { mxgraph } from 'mxgraph';
import { mxgraphFactory } from '../../components/mxgraph-factory';
import MxGraphConfigurator from './mxGraph/MxGraphConfigurator';
import { MxGraphBpmnStyles } from './mxGraph/MxGraphBpmnStyles';
import MxGraphModelUpdater from './mxGraph/MxGraphModelUpdater';
const { mxEvent, mxClient, mxLog, mxUtils, mxGraph, mxGraphModel, mxPoint } = mxgraphFactory({
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

mxGraph.prototype.edgeLabelsMovable = false;
mxGraph.prototype.cellsLocked = true;

// Overrides method to provide a cell label in the display
mxGraph.prototype.convertValueToString = function(cell) {
  if (mxUtils.isNode(cell.value)) {
    if (cell.value.nodeName != undefined && cell.value.nodeName == MxGraphBpmnStyles.TASK_CA) {
      return cell.getAttribute('name');
    }
  }

  return cell.value;
};

export default abstract class AbstractGraph {
  protected readonly graph: mxgraph.mxGraph;
  protected readonly mxGraphModelUpdater: MxGraphModelUpdater;

  protected constructor(container: Element) {
    try {
      // Checks if browser is supported
      if (!mxClient.isBrowserSupported()) {
        // Displays an error message if the browser is  not supported.
        return mxUtils.error('Browser is not supported!', 200, false);
      }

      const model = new mxGraphModel();
      this.graph = new mxGraph(container, model);

      this.initMxLog();

      this.handleClick();
      this.autoResizeContainer();
      new MxGraphConfigurator(this.graph).configureStyles();

      this.mxGraphModelUpdater = new MxGraphModelUpdater(this.graph);

      /*// Animation on all transitions
      graph.addListener('size', function() {
        // Adds animation to edge shape and makes "pipe" visible
        graph.view.states.visit(function(key, state) {
          if (graph.model.isEdge(state.cell)) {
            state.shape.node.getElementsByTagName('path')[0].removeAttribute('visibility');
            state.shape.node.getElementsByTagName('path')[0].setAttribute('stroke-width', '3');
            state.shape.node.getElementsByTagName('path')[0].setAttribute('stroke', 'pink');
            state.shape.node.getElementsByTagName('path')[1].setAttribute('class', 'flow');
          }
        });
      });*/
    } catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      throw e; // for debugging
    }
  }

  private initMxLog(): void {
    mxLog.TRACE = true;
    mxLog.DEBUG = true;
    mxLog.show();
  }

  private handleClick(resizeGraph?: Function) {
    this.graph.addListener(mxEvent.CLICK, function(sender, evt) {
      const cell = evt.getProperty('cell'); // cell may be null

      function isSet(property: string): boolean {
        return property != undefined && property != null && property != 'null' && property.length > 0;
      }

      if (cell != null) {
        if (cell.vertex != null && cell.vertex == 1) {
          if (cell.value.nodeName != undefined && cell.value.nodeName == MxGraphBpmnStyles.TASK_CA) {
            const href = cell.getAttribute('href');
            if (isSet.call(this, href)) {
              window.open(href);
            }

            const modalId = cell.getAttribute('modalId');
            if (isSet.call(this, modalId)) {
              const modal = document.getElementById(modalId);
              if (modal != null) {
                modal.style.display = 'block';
              }
            }

            const subProcessId = cell.getAttribute('subProcessId');
            if (isSet.call(this, subProcessId)) {
              const subProcess = document.getElementById(subProcessId);
              if (subProcess != null) {
                subProcess.style.display = 'block';
              }
            }

            if (!isSet.call(this, href) && !isSet.call(this, modalId) && !isSet.call(this, subProcessId)) {
              mxUtils.alert('No URL defined');
              console.log('No URL defined');
            }
          }
        }
      }
      evt.consume();
    });
  }

  private autoResizeContainer() {
    // Auto-resize the container
    this.graph.border = 40;
    this.graph.getView().translate = new mxPoint(this.graph.border / 2, this.graph.border / 2);
    this.graph.setResizeContainer(true);
    this.graph.graphHandler.setRemoveCellsFromParent(false);
  }

  abstract loadGraph(): void;
}
