import { mxgraph, mxgraphFactory } from 'mxgraph-factory';
import { BpmnGatewayShape, SHAPE_BPMN_GATEWAY } from './bpmn-shapes';

const {
  mxGraph,
  mxEvent,
  mxClient,
  mxUtils,
  mxConstants,
  mxEditor,
  mxPanningManager,
  mxEdgeHandler,
  mxGuide,
  mxGraphHandler,
  // for overlays example
  mxCellOverlay,
  mxCellTracker,
  mxImage,
  // to manipulate mxgraph console
  mxLog,
  // for create tasks registration
  //mxResources,
  // for xml display
  mxCodec,
  // custom shapes
  mxCellRenderer, mxShape
} = mxgraphFactory({
  mxLoadResources: false, // for graph and editors resources files
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

  public loadGraph(): void {
    this.loadGraph_(null);
  }

  public loadGraph_(graphName: string): void {
    if (graphName == null) {
      console.info('Do not log graph, do this with UI through actions');
      return;
    }

    if (graphName == 'sample') {
      this.loadGraphSample();
    } else {
      this.loadGraphFromFile();
    }
    this.editor.execute('fit', null, null);
  }

  private loadGraphFromFile(): void {
    const req = mxUtils.load('resources/diagrams/travel-booking.xml');
    const root = req.getDocumentElement();

    // const newGraphModel = mxUtils.parseXml(root);
    // const node = newGraphModel.documentElement;
    this.editor.readGraphModel(root);
  }

  private loadGraphSample(): void {
    // Adds cells to the model in a single step
    this.editor.graph.getModel().beginUpdate();

    try {
      this.editor.graph.getModel().clear(); // ensure to remove manual changes or already loaded graphs
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

      const styleGateway = mxUtils.clone(style);
      styleGateway[mxConstants.STYLE_SHAPE] = SHAPE_BPMN_GATEWAY;
      this.editor.graph.getStylesheet().putCellStyle('gateway', styleGateway);

      const parent = this.editor.graph.getDefaultParent();

      // already existing styles
      const swimlane = this.editor.graph.insertVertex(parent, null, 'My custom swimlane', 20, 20, 600, 400, 'swimlane');

      const v1 = this.editor.graph.insertVertex(swimlane, null, null, 40, 20, 40, 40, 'gateway');
      const v2 = this.editor.graph.insertVertex(swimlane, null, 'World!', 200, 150, 80, 30, 'styleCloud');
      this.editor.graph.insertEdge(swimlane, null, '', v1, v2);
      const end = this.editor.graph.insertVertex(swimlane, null, 'end event', 200, 300, 30, 30, 'end');
      this.editor.graph.insertEdge(swimlane, null, '', v2, end);
    } finally {
      // Updates the display
      this.editor.graph.getModel().endUpdate();
    }
  }

  // ===========================================================================================================================================================================
  // CONFIGURATION
  // ===========================================================================================================================================================================

  public init(): void {
    try {
      if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
      } else {
        this.initPanning();
        this.enableTitleUpdate();

        this.configureEditorFunctions();
        this.configureEditorActions();

        this.registerCustomShapes();

        this.registerCreateTasks();
        this.editor.showTasks();

        this.configureCellPrecedingHighlighter();

        mxLog.show();
        mxLog.TRACE = true;
        mxLog.DEBUG = true;
        // TODO log warn: js docs explain we can pass a message
        // mxLog.warn('Hello, World!');
        // mxLog.warn();

        // Displays version in statusbar
        this.editor.setStatus('POC using mxGraph ' + mxClient.VERSION);
      }
    } catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      throw e; // for debugging
    }
    this.initView();
  }

  private registerCustomShapes(): void {
    console.info('####register BPMN Shapes');
    mxCellRenderer.registerShape(SHAPE_BPMN_GATEWAY, BpmnGatewayShape);
    console.info('####BPMN Shapes registered');
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

  // the following functions are defined in the xml configuration but seem not loaded in our typescript/webcomponent poc
  private configureEditorFunctions(): void {
    this.editor.graph.convertValueToString = function(cell) {
      // ensure the cell labels are taken from the xml model when exist, see https://jgraph.github.io/mxgraph/docs/js-api/files/view/mxGraph-js.html#mxGraph.convertValueToString
      const label = cell.getAttribute('label');
      if (label != null) {
        return label;
      }

      // original implementation, display value created directly with the api, like in loadGraphSample
      const value = this.model.getValue(cell);
      if (value != null) {
        return value;
        // if (mxUtils.isNode(value)) {
        //   return value.nodeName;
        // } else if (typeof value.toString == 'function') {
        //   return value.toString();
        // }
      }

      return '';
    };

    this.editor.graph.getTooltipForCell = function(cell) {
      let href = cell.getAttribute('href');
      href = href != null && href.length > 0 ? '<br>' + href : '';
      const maxLen = 30;
      let desc = cell.getAttribute('description');
      if (desc == null || desc.length == 0) {
        desc = '';
      } else if (desc.length < maxLen) {
        desc = '<br>' + desc;
      } else {
        desc = '<br>' + desc.substring(0, maxLen) + '...';
      }
      return '<b>' + cell.getAttribute('label') + '</b> (' + cell.getId() + ')' + href + desc + '<br>Edges: ' + cell.getEdgeCount() + '<br>Children: ' + cell.getChildCount();
    };
  }

  // the following actions are defined in the xml configuration but seem not loaded in our typescript/webcomponent poc
  private configureEditorActions(): void {
    this.editor.addAction('opacity', function(editor) {
      const opacity = mxUtils.prompt('enterOpacity', '100');

      if (opacity != null && opacity >= 0 && opacity <= 100) {
        editor.graph.setCellStyles('opacity', opacity);
      }
    });
    this.editor.addAction('showXml', function(editor) {
      const encoder = new mxCodec();
      const node = encoder.encode(editor.graph.getModel());
      mxUtils.popup(mxUtils.getPrettyXml(node), true);
    });
    this.editor.addAction('open', function(editor) {
      editor.open(mxUtils.prompt('Enter filename', 'workflow.xml'));
    });
    this.editor.addAction('openHref', function(editor, cell) {
      cell = cell || editor.graph.getSelectionCell();

      if (cell == null) {
        cell = editor.graph.getCurrentRoot();
        if (cell == null) {
          cell = editor.graph.getModel().getRoot();
        }
      }
      if (cell != null) {
        const href = cell.getAttribute('href');
        if (href != null && href.length > 0) {
          window.open(href);
        } else {
          mxUtils.alert('No URL defined. Showing properties...');
          editor.execute('showProperties', cell);
        }
      }
    });

    // Layout
    this.editor.addAction('horizontalTree', function(editor, cell) {
      cell = cell || editor.graph.getSelectionCell();
      if (cell == null) {
        cell = editor.graph.getDefaultParent();
      }

      editor.treeLayout(cell, true);
    });
    this.editor.addAction('verticalTree', function(editor, cell) {
      cell = cell || editor.graph.getSelectionCell();
      if (cell == null) {
        cell = editor.graph.getDefaultParent();
      }

      editor.treeLayout(cell, false);
    });

    // custom actions
    const currentConfigurator = this;
    this.editor.addAction('changeCustomOverlaysState', function(editor) {
      currentConfigurator.changeCustomOverlaysState();
    });
    this.editor.addAction('changePathHighlighterState', function(editor) {
      currentConfigurator.changePathHighlighterState();
    });
    this.editor.addAction('loadGraphSample', function(editor) {
      currentConfigurator.loadGraph_('sample');
    });
    this.editor.addAction('loadGraphTravelBooking', function(editor) {
      currentConfigurator.loadGraph_('travel-booking');
    });
  }

  private registerCreateTasks(): void {
    const configurator = this;
    const currentEditor = this.editor;

    this.editor.createTasks = function(div) {
      const off = 30;

      if (currentEditor.graph != null) {
        const layer = currentEditor.graph.model.root.getChildAt(0);
        mxUtils.para(div, 'Graphs');
        mxUtils.linkInvoke(div, 'New', currentEditor, 'open', 'resources/diagrams/empty.xml', off);
        mxUtils.br(div);
        mxUtils.linkAction(div, 'Marcin Sample', currentEditor, 'loadGraphSample', off);
        mxUtils.br(div);
        mxUtils.linkAction(div, 'Custom travel-booking', currentEditor, 'loadGraphTravelBooking', off);
        mxUtils.br(div);

        mxUtils.linkInvoke(div, 'Open swimlanes', currentEditor, 'open', 'resources/diagrams/swimlanes.xml', off);
        mxUtils.br(div);
        mxUtils.linkInvoke(div, 'Open withdrawal', currentEditor, 'open', 'resources/diagrams/withdrawal.xml', off);
        mxUtils.br(div);

        mxUtils.para(div, 'Global');
        mxUtils.linkAction(div, 'Path Highlighter', currentEditor, 'changePathHighlighterState', off);
        mxUtils.br(div);
        mxUtils.linkAction(div, 'Custom Overlays', currentEditor, 'changeCustomOverlaysState', off);
        mxUtils.br(div);

        // mxUtils.para(div, 'Highlight Paths');
        // mxUtils.linkAction(div, 'disable', currentEditor, 'disablePathHighLights', off);
        // mxUtils.br(div);
        // mxUtils.linkAction(div, 'path 1', currentEditor, 'highlightPath1', off);
        // mxUtils.br(div);
        // mxUtils.linkAction(div, 'path 2', currentEditor, 'highlightPath2', off);
        // mxUtils.br(div);

        if (!currentEditor.graph.isSelectionEmpty()) {
          const cell = currentEditor.graph.getSelectionCell();
          if ((currentEditor.graph.getSelectionCount() == 1 && currentEditor.graph.model.isVertex(cell) && cell.getEdgeCount() > 0) || currentEditor.graph.isSwimlane(cell)) {
            mxUtils.para(div, 'Layout');
            mxUtils.linkAction(div, 'verticalTree', currentEditor, 'verticalTree', off);
            mxUtils.br(div);
            mxUtils.linkAction(div, 'horizontalTree', currentEditor, 'horizontalTree', off);
            mxUtils.br(div);
          }

          mxUtils.para(div, 'Format');

          if (mxUtils.isNode(cell.value, 'Symbol')) {
            mxUtils.linkAction(div, 'image', currentEditor, 'image', off);
            mxUtils.br(div);
          } else {
            mxUtils.linkAction(div, 'opacity', currentEditor, 'opacity', off);
            mxUtils.br(div);
            if (currentEditor.graph.model.isVertex(cell) || (cell.style != null && cell.style.indexOf('arrowEdge') >= 0)) {
              mxUtils.linkAction(div, 'gradientColor', currentEditor, 'gradientColor', off);
              mxUtils.br(div);
            }
            if (currentEditor.graph.model.isEdge(cell)) {
              mxUtils.linkAction(div, 'Straight Connector', currentEditor, 'straightConnector', off);
              mxUtils.br(div);
              mxUtils.linkAction(div, 'Elbow Connector', currentEditor, 'elbowConnector', off);
              mxUtils.br(div);
              mxUtils.linkAction(div, 'Arrow Connector', currentEditor, 'arrowConnector', off);
              mxUtils.br(div);
            }
          }

          mxUtils.linkAction(div, 'Rounded', currentEditor, 'toggleRounded', off);
          mxUtils.br(div);
          if (currentEditor.graph.isSwimlane(cell) || currentEditor.graph.model.isEdge(cell)) {
            mxUtils.linkAction(div, 'Orientation', currentEditor, 'toggleOrientation', off);
            mxUtils.br(div);
          }

          if (currentEditor.graph.getSelectionCount() > 1) {
            mxUtils.para(div, 'align');
            mxUtils.linkAction(div, 'left', currentEditor, 'alignCellsLeft', off);
            mxUtils.br(div);
            mxUtils.linkAction(div, 'center', currentEditor, 'alignCellsCenter', off);
            mxUtils.br(div);
            mxUtils.linkAction(div, 'right', currentEditor, 'alignCellsRight', off);
            mxUtils.br(div);
            mxUtils.linkAction(div, 'top', currentEditor, 'alignCellsTop', off);
            mxUtils.br(div);
            mxUtils.linkAction(div, 'middle', currentEditor, 'alignCellsMiddle', off);
            mxUtils.br(div);
            mxUtils.linkAction(div, 'bottom', currentEditor, 'alignCellsBottom', off);
            mxUtils.br(div);
          }

          mxUtils.para(div, 'selection');
          mxUtils.linkAction(div, 'clearSelection', currentEditor, 'selectNone', off);
          mxUtils.br(div);
        } else if (layer.getChildCount() > 0) {
          mxUtils.para(div, 'selection');
          mxUtils.linkAction(div, 'selectAll', currentEditor, 'selectAll', off);
          mxUtils.br(div);
        }

        mxUtils.br(div);
      }
    };
  }

  // ===========================================================================================================================================================================
  // UGLY, SHOULD BE MOVED IN DEDICATED CLASSES
  // ===========================================================================================================================================================================
  // Adapted from the 'overlays' example
  // private customOverlaysListener: any;
  private isCustomOverlaysEnabled = false;
  private customOverlaysCellTracker: mxgraph.mxCellTracker;

  private changeCustomOverlaysState(): void {
    const graph = this.editor.graph;
    if (!this.isCustomOverlaysEnabled) {
      graph.addListener(mxEvent.CLICK, this.customOverlaysListener);
      // Highlights the vertices when the mouse enters
      if (this.customOverlaysCellTracker == null) {
        this.customOverlaysCellTracker = new mxCellTracker(graph, 'red', null); // TS force usage of a function as 3rd argument (getCell)
      }
      this.customOverlaysCellTracker.setEnabled(true);
    } else {
      graph.removeListener(this.customOverlaysListener);
      this.customOverlaysCellTracker.setEnabled(false);
    }
    this.isCustomOverlaysEnabled = !this.isCustomOverlaysEnabled;
  }

  public customOverlaysListener(sender, evt): void {
    console.info(sender);
    const graph = sender.cellEditor.graph;
    // const graph = this.editor.graph;
    // Disables basic selection and cell handling --> don't do it here to keep editor features
    // graph.setEnabled(false);

    // Highlights the vertices when the mouse enters
    // const cellTracker = new mxCellTracker(graph, 'red', null); // TS add a function as 3rd argument
    //
    // // Enables tooltips for the overlays
    // graph.setTooltips(true);

    // Installs a handler for click events in the graph
    // that toggles the overlay for the respective cell
    // graph.addListener(mxEvent.CLICK, function(sender, evt) {
    const cell = evt.getProperty('cell');

    if (cell != null) {
      const overlays = graph.getCellOverlays(cell);

      if (overlays == null) {
        // Creates a new overlay with an image and a tooltip
        const overlay = new mxCellOverlay(new mxImage('images/overlays/check.png', 16, 16), 'Overlay tooltip');

        // Installs a handler for clicks on the overlay
        overlay.addListener(mxEvent.CLICK, function(sender, evt2) {
          mxUtils.alert('Overlay clicked');
        });

        // Sets the overlay for the cell in the graph
        graph.addCellOverlay(cell, overlay);
      } else {
        graph.removeCellOverlays(cell);
      }
    }
    // });
  }

  // ===========================================================================================================================================================================
  // UGLY, SHOULD BE MOVED IN DEDICATED CLASSES
  // Path highlighter
  // ===========================================================================================================================================================================

  private highlightMouseListener: any;
  private isHighlightPreviousPathEnabled = false;

  private changePathHighlighterState(): void {
    const graph = this.editor.graph;
    if (!this.isHighlightPreviousPathEnabled) {
      graph.addMouseListener(this.highlightMouseListener);
    } else {
      graph.removeMouseListener(this.highlightMouseListener);
    }
    this.isHighlightPreviousPathEnabled = !this.isHighlightPreviousPathEnabled;
  }

  // TODO change by enable/disable
  // TODO see hotspot configuration
  private configureCellPrecedingHighlighter(): void {
    const graph = this.editor.graph;
    // Highlights the vertices when the mouse enters
    // const cellTracker = new mxCellTracker(graph, 'blue', null); // TS add a function as 3rd argument
    // console.log('configure cell tracker, isEventsEnabled?' + cellTracker.isEventsEnabled());

    // TODO voir pour utiliser directement https://jgraph.github.io/mxgraph/docs/js-api/files/handler/mxCellHighlight-js.html
    // const highlight = new mxgraph.mxCellHighlight(graph, '#ff0000', 2, null);
    // et un listener qui appel le highlighter sur une grappe de cells via un listener
    this.configureMouseListenerForCellHighlight(graph);

    // not usable, only inform that a mark has been done
    // cellTracker.addListener(mxEvent.MARK, (sender, evt: mxgraph.mxEventObject) => {
    //   console.log('MARK EVENT!');
    //   console.log(evt);
    // });
    // graph.getSelectionModel().addListener(mxEvent.CHANGE, (sender, evt) => {
    //   console.log('GRAPH selection model CHANGE EVENT!');
    //   console.log(evt);
    // });

    // for detection on mouse click
    // graph.addListener(mxEvent.CLICK, function(sender, evt: mxgraph.mxEventObject) {
    //   const cell = evt.getProperty('cell');
    //   console.log('global click evt, cell ' + cell);
    //
    //   if (cell != null) {
    //     const mxCellsToHighlight = BpmnJs.findAllPreviousGraphStartingFrom(cell as mxgraph.mxCell);
    //     console.log('mxCellsToHighlight: ' + mxCellsToHighlight.size);
    //
    //     console.log('Starting highlight');
    //     // mxCellsToHighlight.forEach(cell => {
    //     //   highlight.highlight(graph.view.getState(cell));
    //     // });
    //     console.log('Highlight done!');
    //   }
    // });
  }

  private static findAllPreviousGraphStartingFrom(startingCell: mxgraph.mxCell): Set<mxgraph.mxCell> {
    const allCells = new Set<mxgraph.mxCell>();

    let previousVertexes: mxgraph.mxCell[] = BpmnJs.findDirectPreviousVertexesInGraph(startingCell, allCells);
    // TODO remove 'allCells.size check' when duplicates mgt is done
    while (previousVertexes.length > 0 && allCells.size < 50) {
      let newPreviousVertexes: mxgraph.mxCell[] = [];
      previousVertexes.forEach(vertex => {
        const toBeMerged = BpmnJs.findDirectPreviousVertexesInGraph(vertex, allCells);
        newPreviousVertexes = [...newPreviousVertexes, ...toBeMerged];
      });
      previousVertexes = newPreviousVertexes;
    }

    return allCells;
  }

  // TODO manage duplicates that could occur on loop (should check if not already present) - risk of infinite loop
  private static findDirectPreviousVertexesInGraph(mxCell: mxgraph.mxCell, alreadyDetectedCells: Set<mxgraph.mxCell>): mxgraph.mxCell[] {
    const previousVertexes: mxgraph.mxCell[] = [];
    console.log('entering findPreviousVertexesInGraph');

    console.log('alreadyDetectedCells: ' + alreadyDetectedCells.size);
    const currentCellId = mxCell.getId();
    console.log('Current cell id: ' + currentCellId);
    // TODO do we really need to proceed if already in list
    alreadyDetectedCells.add(mxCell);

    console.log('Edges count: ' + mxCell.getEdgeCount());
    if (mxCell.getEdgeCount()) {
      console.log('Has edges, processing');

      mxCell.edges.forEach(edge => {
        console.log(edge);
        if (edge.target.getId() == currentCellId) {
          console.log('edge target the current mxCell');
          if (!alreadyDetectedCells.has(edge)) {
            console.log('edge not already detected');
            alreadyDetectedCells.add(edge);
            previousVertexes.push(edge.source);
          }
        }
      });
    }

    if (mxCell.isEdge()) {
      console.log('is edge, getting source');
      previousVertexes.push(mxCell.source);
    }

    console.log('exiting findPreviousVertexesInGraph');
    console.log('alreadyDetectedCells: ' + alreadyDetectedCells.size);
    console.log('previousVertexes: ' + previousVertexes.length);
    return previousVertexes;
  }

  private configureMouseListenerForCellHighlight(graph: mxgraph.mxGraph): void {
    this.highlightMouseListener = {
      cell: null,
      mouseDown: function(sender, me) {},
      mouseMove: function(sender, me) {
        const tmp = me.getCell();

        if (tmp != this.cell) {
          if (this.cell != null) {
            this.dragLeave(me.getEvent(), this.cell);
          }

          this.cell = tmp;

          if (this.cell != null) {
            this.dragEnter(me.getEvent(), this.cell);
          }
        }

        // if (this.cell != null) {
        //   this.dragOver(me.getEvent(), this.cell);
        // }
      },
      mouseUp: function(sender, me) {},
      dragEnter: (evt, cell: mxgraph.mxCell) => {
        console.log('dragEnter', cell.value);
        console.log(cell);

        // TODO create a method inModelTransaction taking a function as parameter
        graph.getModel().beginUpdate();
        try {
          mxUtils.setCellStyles(graph.getModel(), Array.from(BpmnJs.findAllPreviousGraphStartingFrom(cell)), 'opacity', 20);
          // mxUtils.setCellStyles(graph.getModel(), new Array(cell), 'opacity', 20);
        } finally {
          // Updates the display
          graph.getModel().endUpdate();
        }
      },
      dragOver: function(evt, cell) {
        console.log('dragOver', cell.value);
      },
      dragLeave: function(evt, cell) {
        console.log('dragLeave', cell.value);
        console.log(cell);
        // TODO duplication, use the markCells function
        graph.getModel().beginUpdate();
        try {
          mxUtils.setCellStyles(graph.getModel(), Array.from(BpmnJs.findAllPreviousGraphStartingFrom(cell)), 'opacity', 100);
          // mxUtils.setCellStyles(graph.getModel(), new Array(cell), 'opacity', 20);
        } finally {
          // Updates the display
          graph.getModel().endUpdate();
        }
      },
      markCells: function(baseCell: mxgraph.mxCell, isHighlighted: boolean) {
        const opacity = isHighlighted ? 20 : 100;
        // TODO create a method inModelTransaction taking a function as parameter
        graph.getModel().beginUpdate();
        try {
          mxUtils.setCellStyles(graph.getModel(), Array.from(BpmnJs.findAllPreviousGraphStartingFrom(baseCell)), 'opacity', opacity);
          // mxUtils.setCellStyles(graph.getModel(), new Array(cell), 'opacity', 20);
        } finally {
          // Updates the display
          graph.getModel().endUpdate();
        }
      },
    };
  }
}
