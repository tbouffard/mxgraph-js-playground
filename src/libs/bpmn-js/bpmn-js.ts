import {mxgraph, mxgraphFactory} from 'mxgraph-factory';

const {mxGraph, mxEvent, mxClient, mxUtils, mxConstants, mxEditor, mxPanningManager, mxEdgeHandler, mxGuide, mxGraphHandler} = mxgraphFactory({
  mxLoadResources: false,
  mxLoadStylesheets: false,
});

interface IVisuEditor extends mxgraph.mxEditor {
  graph: mxgraph.mxGraph;
}

export class BpmnJs {

  private readonly editor: IVisuEditor;

  constructor(config) {
    const configNode = mxUtils.load(config).getDocumentElement();
    this.editor = new mxEditor(configNode) as IVisuEditor;
    this.init();
  }

  public loadSampleGraph() {
    // Adds cells to the model in a single step
    this.editor.graph.getModel().beginUpdate();
    try {
      const style = mxUtils.clone(this.editor.graph.getStylesheet().getDefaultVertexStyle());

      const styleRhombus = mxUtils.clone(style);
      styleRhombus[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
      this.editor.graph.getStylesheet().putCellStyle('condition', styleRhombus);

      const styleCloud = mxUtils.clone(style);
      styleCloud[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CLOUD;
      this.editor.graph.getStylesheet().putCellStyle('styleCloud', styleCloud);

      const styleEnd = mxUtils.clone(styleRhombus);
      styleEnd[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_DOUBLE_ELLIPSE;
      this.editor.graph.getStylesheet().putCellStyle('end', styleEnd);

      const parent = this.editor.graph.getDefaultParent();
      const v1 = this.editor.graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30, 'condition');
      const v2 = this.editor.graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30, 'styleCloud');
      this.editor.graph.insertEdge(parent, null, '', v1, v2);
      const end = this.editor.graph.insertVertex(parent, null, 'end event', 200, 300, 30, 30, 'end');
      this.editor.graph.insertEdge(parent, null, '', v2, end);
      this.editor.graph.insertVertex(parent, null, 'end event', 400, 400, 100, 45, 'shape=image;image=data:image/svg+xml,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJFYmVuZV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDI1MCAyNTAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI1MCAyNTA7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4mI3hhOzxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+JiN4YTsJLnN0MHtmaWxsOiNhMmEyYTI7fSYjeGE7CS5zdDF7ZmlsbDojOGU4ZThlO30mI3hhOwkuc3Qye2ZpbGw6I0ZGRkZGRjt9JiN4YTs8L3N0eWxlPiYjeGE7PHRpdGxlPlplaWNoZW5mbMOkY2hlIDE8L3RpdGxlPiYjeGE7PHBhdGggY2xhc3M9InN0MCIgZD0iTTIzNy41LDIyNy45YzAsNS4zLTQuMyw5LjYtOS41LDkuNmMwLDAsMCwwLDAsMEgyMi4xYy01LjMsMC05LjYtNC4zLTkuNi05LjVjMCwwLDAsMCwwLDBWMjIuMSAgYzAtNS4zLDQuMy05LjYsOS41LTkuNmMwLDAsMCwwLDAsMGgyMDUuOWM1LjMsMCw5LjYsNC4zLDkuNiw5LjVjMCwwLDAsMCwwLDBWMjI3Ljl6Ii8+JiN4YTs8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMjM3LjUsMjI3LjljMCw1LjMtNC4zLDkuNi05LjUsOS42YzAsMCwwLDAsMCwwSDg5LjZMNDQuOCwxOTJsMjcuOS00NS41bDgyLjctMTAyLjdsODIuMSw4NC41VjIyNy45eiIvPiYjeGE7PHBhdGggY2xhc3M9InN0MiIgZD0iTTE5Ny4xLDEzOC4zaC0yMy43bC0yNS00Mi43YzUuNy0xLjIsOS44LTYuMiw5LjctMTJWNTEuNWMwLTYuOC01LjQtMTIuMy0xMi4yLTEyLjNjMCwwLTAuMSwwLTAuMSwwaC00MS43ICBjLTYuOCwwLTEyLjMsNS40LTEyLjMsMTIuMmMwLDAsMCwwLjEsMCwwLjF2MzIuMWMwLDUuOCw0LDEwLjgsOS43LDEybC0yNSw0Mi43SDUyLjljLTYuOCwwLTEyLjMsNS40LTEyLjMsMTIuMmMwLDAsMCwwLjEsMCwwLjEgIHYzMi4xYzAsNi44LDUuNCwxMi4zLDEyLjIsMTIuM2MwLDAsMC4xLDAsMC4xLDBoNDEuN2M2LjgsMCwxMi4zLTUuNCwxMi4zLTEyLjJjMCwwLDAtMC4xLDAtMC4xdi0zMi4xYzAtNi44LTUuNC0xMi4zLTEyLjItMTIuMyAgYzAsMC0wLjEsMC0wLjEsMGgtNGwyNC44LTQyLjRoMTkuM2wyNC45LDQyLjRoLTQuMWMtNi44LDAtMTIuMyw1LjQtMTIuMywxMi4yYzAsMCwwLDAuMSwwLDAuMXYzMi4xYzAsNi44LDUuNCwxMi4zLDEyLjIsMTIuMyAgYzAsMCwwLjEsMCwwLjEsMGg0MS43YzYuOCwwLDEyLjMtNS40LDEyLjMtMTIuMmMwLDAsMC0wLjEsMC0wLjF2LTMyLjFjMC02LjgtNS40LTEyLjMtMTIuMi0xMi4zICBDMTk3LjIsMTM4LjMsMTk3LjIsMTM4LjMsMTk3LjEsMTM4LjN6Ii8+JiN4YTs8L3N2Zz4=;');
    } finally {
      // Updates the display
      this.editor.graph.getModel().endUpdate();
    }
  }

  public init() {
    try {
      if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
      } else {
        this.initPaning();
        this.enableTitleUpdate();
        // Displays version in statusbar
        this.editor.setStatus('mxGraph ' + mxClient.VERSION);
      }
    } catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      throw e; // for debugging
    }
    this.initView();
  }

  private initView() {
    mxConstants.DEFAULT_HOTSPOT = 1;
    mxGraph.prototype.htmlLabels = true;
    mxGraph.prototype.isWrapping = () => true;
    // Enables guides
    mxGraphHandler.prototype.guidesEnabled = true;
    // Alt disables guides
    mxGuide.prototype.isEnabledForEvent = (evt) => !mxEvent.isAltDown(evt);
    // Enables snapping waypoints to terminals
    mxEdgeHandler.prototype.isSnapToTerminalsEvent = () => true;
  }

  private enableTitleUpdate() {
    // Updates the window title after opening new files
    const title = document.title;
    const changeTitleHandler = (sender) => { document.title = title + ' - ' + sender.getTitle(); };
    this.editor.addListener(mxEvent.OPEN, changeTitleHandler);
    // Prints the current root in the window title if the
    // current root of the graph changes (drilling).
    this.editor.addListener(mxEvent.ROOT, changeTitleHandler);
    changeTitleHandler(this.editor);
  }

  private initPaning() {
    // Adds active border for panning inside the container
    this.editor.graph.createPanningManager = function() {
      const pm = new mxPanningManager(this);
      pm.border = 30;
      return pm;
    };
    this.editor.graph.allowAutoPanning = true;
    this.editor.graph.timerAutoScroll = true;
  }
}
