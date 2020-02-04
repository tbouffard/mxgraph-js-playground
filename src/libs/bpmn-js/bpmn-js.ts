import { mxgraph, mxgraphFactory } from 'mxgraph-factory';

const { mxGraph, mxEvent, mxClient, mxUtils, mxConstants, mxEditor, mxPanningManager, mxEdgeHandler, mxGuide, mxGraphHandler } = mxgraphFactory({
  mxLoadResources: false,
  mxLoadStylesheets: false,
});

interface VisuEditor extends mxgraph.mxEditor {
  graph: mxgraph.mxGraph;
}

export class BpmnJs {
  private readonly editor: VisuEditor;

  constructor(config) {
    const configNode = mxUtils.load(config).getDocumentElement();
    this.editor = new mxEditor(configNode) as VisuEditor;
    this.init();
  }

  public loadSampleGraph(): void {
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

      // already existing styles
      const swimlane = this.editor.graph.insertVertex(parent, null, 'My custom swimlane,', 200, 500, 300, 160, 'swimlane;fillColor=#83027F');

      const v1 = this.editor.graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30, 'condition');
      const v2 = this.editor.graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30, 'styleCloud');
      this.editor.graph.insertEdge(parent, null, '', v1, v2);
      const end = this.editor.graph.insertVertex(parent, null, 'end event', 200, 300, 30, 30, 'end');
      this.editor.graph.insertEdge(parent, null, '', v2, end);
    } finally {
      // Updates the display
      this.editor.graph.getModel().endUpdate();
    }
  }

  public init(): void {
    try {
      if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
      } else {
        this.initPanning();
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

  private initView(): void {
    mxConstants.DEFAULT_HOTSPOT = 1;
    mxGraph.prototype.htmlLabels = true;
    mxGraph.prototype.isWrapping = () => true;
    // Enables guides
    mxGraphHandler.prototype.guidesEnabled = true;
    // Alt disables guides
    mxGuide.prototype.isEnabledForEvent = evt => !mxEvent.isAltDown(evt);
    // Enables snapping waypoints to terminals
    mxEdgeHandler.prototype.isSnapToTerminalsEvent = () => true;
  }

  private enableTitleUpdate(): void {
    // Updates the window title after opening new files
    const title = document.title;
    const changeTitleHandler = (sender): void => {
      document.title = title + ' - ' + sender.getTitle();
    };
    this.editor.addListener(mxEvent.OPEN, changeTitleHandler);
    // Prints the current root in the window title if the
    // current root of the graph changes (drilling).
    this.editor.addListener(mxEvent.ROOT, changeTitleHandler);
    changeTitleHandler(this.editor);
  }

  private initPanning(): void {
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
