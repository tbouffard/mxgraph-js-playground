import {mxgraph, mxgraphFactory} from 'mxgraph-factory';

const {mxGraph, mxGraphModel, mxRubberband, mxEvent, mxClient, mxUtils, mxConstants, mxPerimeter} = mxgraphFactory({
  mxLoadResources: false,
  mxLoadStylesheets: false,
});

export class BpmnJs {

  private readonly container: HTMLElement;
  private model: mxgraph.mxGraphModel;
  private graph: mxgraph.mxGraph;
  private parent: mxgraph.mxCell;
  private rubberBand: mxgraph.mxRubberband;

  constructor(container) {
    this.container = container;
    this.init();
  }

  public draw() {
    console.log(this.model);
    // Adds cells to the model in a single step
    this.graph.getModel().beginUpdate();
    try {
      const style = mxUtils.clone(this.graph.getStylesheet().getDefaultVertexStyle());

      const styleRhombus = mxUtils.clone(style);
      styleRhombus[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS;
      this.graph.getStylesheet().putCellStyle('condition', styleRhombus);

      const styleCloud = mxUtils.clone(style);
      styleCloud[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CLOUD;
      this.graph.getStylesheet().putCellStyle('styleCloud', styleCloud);

      const styleEnd = mxUtils.clone(styleRhombus);
      styleEnd[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_DOUBLE_ELLIPSE;
      this.graph.getStylesheet().putCellStyle('end', styleEnd);

      const v1 = this.graph.insertVertex(this.parent, null, 'Hello,', 20, 20, 80, 30, 'condition');
      const v2 = this.graph.insertVertex(this.parent, null, 'World!', 200, 150, 80, 30, 'styleCloud');
      const e1 = this.graph.insertEdge(this.parent, null, '', v1, v2);
      const end = this.graph.insertVertex(this.parent, null, 'end event', 200, 300, 30, 30, 'end');
      const e2 = this.graph.insertEdge(this.parent, null, '', v2, end);
      const test = this.graph.insertVertex(this.parent, null, 'end event', 300, 400, 100, 45, 'shape=image;image=data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDEyLjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgNTE0NDgpICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCIgWw0KCTwhRU5USVRZIG5zX3N2ZyAiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KCTwhRU5USVRZIG5zX3hsaW5rICJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj4NCl0+DQo8c3ZnIGNsYXNzPSJzaGFwZSIgdmVyc2lvbj0iMS4xIiBpZD0iU3R1ZGlvVGFzayIgeG1sbnM9IiZuc19zdmc7IiB4bWxuczp4bGluaz0iJm5zX3hsaW5rOyIgd2lkdGg9IjkxLjk1MyIgaGVpZ2h0PSI0NS45MzIiDQoJIHZpZXdCb3g9IjAgMCA5MS45NTMgNDUuOTMyIiBzdHlsZT0ib3ZlcmZsb3c6dmlzaWJsZTtlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDkxLjk1MyA0NS45MzI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KDQoJCTxsaW5lYXJHcmFkaWVudCBpZD0iWE1MSURfNF9UYXNrXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIzMjMuMDMwOCIgeTE9Ii0yNjMuOTI5IiB4Mj0iMTI5Ljk4NTQiIHkyPSItMTE5LjY2OTEiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgLTEyMy4yMDIxIC0xMjUuOTkwNykiPg0KCQk8c3RvcCAgb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojQjhCOURBIi8+DQoJCTxzdG9wICBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiNGQkZCRUUiLz4NCgk8L2xpbmVhckdyYWRpZW50Pg0KCTxwYXRoIGZpbGw9InVybCgjWE1MSURfNF9UYXNrXykiIHN0cm9rZT0iIzJDNkRBMyIgc3Ryb2tlLXdpZHRoPSIyIiBkPSJNOTAuOTUzLDM3LjMxNGMwLDQuMjA4LTMuNDEsNy42MTgtNy42MTcsNy42MThIOC42MTgNCgkJQzQuNDExLDQ0LjkzMiwxLDQxLjUyMiwxLDM3LjMxNFY4LjYxOEMxLDQuNDExLDQuNDExLDEsOC42MTgsMWg3NC43MTVjNC4yMDcsMCw3LjYxNywzLjQxMSw3LjYxNyw3LjYxOHYyOC42OTVIOTAuOTUzeiIvPg0KCTxnPg0KCQk8cGF0aCBmaWxsPSIjOUNCOUNDIiBkPSJNMTQuNDYzLDE2Ljc3YzAtMi43Ni0yLjIzOC00Ljk5OC00Ljk5OC00Ljk5OGMtMi43NiwwLTQuOTk4LDIuMjM4LTQuOTk4LDQuOTk4SDE0LjQ2M3oiLz4NCgkJPHBhdGggZmlsbD0iIzJDNkRBMyIgZD0iTTQuMDA0LDE3LjIzMlYxNi43N2MwLTMuMDE2LDIuNDQzLTUuNDYsNS40NjEtNS40NmwwLDBjMy4wMTYsMCw1LjQ1OSwyLjQ0NSw1LjQ1OSw1LjQ2bDAsMHYwLjQ2Mg0KCQkJSDQuMDA0TDQuMDA0LDE3LjIzMnogTTE0LjQ2MywxNi43N3YtMC40NjNWMTYuNzdMMTQuNDYzLDE2Ljc3eiBNMTMuOTc1LDE2LjMwN2MtMC4yMzYtMi4yODctMi4xNjItNC4wNjctNC41MS00LjA3MmwwLDANCgkJCWMtMi4zNSwwLjAwNS00LjI3NSwxLjc4Ni00LjUxMiw0LjA3MmwwLDBIMTMuOTc1TDEzLjk3NSwxNi4zMDd6Ii8+DQoJPC9nPg0KCTxnPg0KCQk8Y2lyY2xlIGZpbGw9IiNEQUUyRjEiIGN4PSI5LjQ2NSIgY3k9IjguMzciIHI9IjMuOTM0Ii8+DQoJCTxwYXRoIGZpbGw9IiMyQzZEQTMiIGQ9Ik01LjA2Nyw4LjM3YzAuMDAyLTIuNDMsMS45NjktNC4zOTcsNC4zOTgtNC4zOTdsMCwwYzIuNDI4LDAsNC4zOTYsMS45NjgsNC4zOTYsNC4zOTdsMCwwDQoJCQljMCwyLjQyOS0xLjk2OSw0LjM5Ni00LjM5Niw0LjM5NmwwLDBDNy4wMzYsMTIuNzY3LDUuMDY5LDEwLjc5OSw1LjA2Nyw4LjM3TDUuMDY3LDguMzd6IE01Ljk5Myw4LjM3DQoJCQljMC4wMDQsMS45MTcsMS41NTUsMy40NjgsMy40NzMsMy40NzJsMCwwYzEuOTE3LTAuMDAzLDMuNDY5LTEuNTU1LDMuNDcxLTMuNDcybDAsMGMtMC4wMDItMS45MTctMS41NTQtMy40NjktMy40NzEtMy40NzNsMCwwDQoJCQlDNy41NDcsNC45MDIsNS45OTcsNi40NTMsNS45OTMsOC4zN0w1Ljk5Myw4LjM3eiIvPg0KCTwvZz4NCjwvZz4NCjwvc3ZnPg0K');
      const test2 = this.graph.insertVertex(this.parent, null, 'end event', 400, 400, 100, 45, 'shape=image;image=data:image/svg+xml,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJFYmVuZV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDI1MCAyNTAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI1MCAyNTA7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4mI3hhOzxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+JiN4YTsJLnN0MHtmaWxsOiNhMmEyYTI7fSYjeGE7CS5zdDF7ZmlsbDojOGU4ZThlO30mI3hhOwkuc3Qye2ZpbGw6I0ZGRkZGRjt9JiN4YTs8L3N0eWxlPiYjeGE7PHRpdGxlPlplaWNoZW5mbMOkY2hlIDE8L3RpdGxlPiYjeGE7PHBhdGggY2xhc3M9InN0MCIgZD0iTTIzNy41LDIyNy45YzAsNS4zLTQuMyw5LjYtOS41LDkuNmMwLDAsMCwwLDAsMEgyMi4xYy01LjMsMC05LjYtNC4zLTkuNi05LjVjMCwwLDAsMCwwLDBWMjIuMSAgYzAtNS4zLDQuMy05LjYsOS41LTkuNmMwLDAsMCwwLDAsMGgyMDUuOWM1LjMsMCw5LjYsNC4zLDkuNiw5LjVjMCwwLDAsMCwwLDBWMjI3Ljl6Ii8+JiN4YTs8cGF0aCBjbGFzcz0ic3QxIiBkPSJNMjM3LjUsMjI3LjljMCw1LjMtNC4zLDkuNi05LjUsOS42YzAsMCwwLDAsMCwwSDg5LjZMNDQuOCwxOTJsMjcuOS00NS41bDgyLjctMTAyLjdsODIuMSw4NC41VjIyNy45eiIvPiYjeGE7PHBhdGggY2xhc3M9InN0MiIgZD0iTTE5Ny4xLDEzOC4zaC0yMy43bC0yNS00Mi43YzUuNy0xLjIsOS44LTYuMiw5LjctMTJWNTEuNWMwLTYuOC01LjQtMTIuMy0xMi4yLTEyLjNjMCwwLTAuMSwwLTAuMSwwaC00MS43ICBjLTYuOCwwLTEyLjMsNS40LTEyLjMsMTIuMmMwLDAsMCwwLjEsMCwwLjF2MzIuMWMwLDUuOCw0LDEwLjgsOS43LDEybC0yNSw0Mi43SDUyLjljLTYuOCwwLTEyLjMsNS40LTEyLjMsMTIuMmMwLDAsMCwwLjEsMCwwLjEgIHYzMi4xYzAsNi44LDUuNCwxMi4zLDEyLjIsMTIuM2MwLDAsMC4xLDAsMC4xLDBoNDEuN2M2LjgsMCwxMi4zLTUuNCwxMi4zLTEyLjJjMCwwLDAtMC4xLDAtMC4xdi0zMi4xYzAtNi44LTUuNC0xMi4zLTEyLjItMTIuMyAgYzAsMC0wLjEsMC0wLjEsMGgtNGwyNC44LTQyLjRoMTkuM2wyNC45LDQyLjRoLTQuMWMtNi44LDAtMTIuMyw1LjQtMTIuMywxMi4yYzAsMCwwLDAuMSwwLDAuMXYzMi4xYzAsNi44LDUuNCwxMi4zLDEyLjIsMTIuMyAgYzAsMCwwLjEsMCwwLjEsMGg0MS43YzYuOCwwLDEyLjMtNS40LDEyLjMtMTIuMmMwLDAsMC0wLjEsMC0wLjF2LTMyLjFjMC02LjgtNS40LTEyLjMtMTIuMi0xMi4zICBDMTk3LjIsMTM4LjMsMTk3LjIsMTM4LjMsMTk3LjEsMTM4LjN6Ii8+JiN4YTs8L3N2Zz4=;');
    } finally {
      // Updates the display
      this.graph.getModel().endUpdate();
    }
    console.log(this.model);
  }

  private init() {
    if (this.container && mxClient.isBrowserSupported()) {
      mxEvent.disableContextMenu(this.container);
      this.model = new mxGraphModel();
      this.graph = this.initGraph();
      // Gets the default parent for inserting new cells.
      this.parent = this.graph.getDefaultParent();
      // Enables rubberband selection
      this.rubberBand = new mxRubberband(this.graph);
    } else {
      // Displays an error message if the browser is not supported.
      mxUtils.error('Browser is not supported!', 200, false);
    }
  }

  private initGraph(): mxgraph.mxGraph {
    const graph = new mxGraph(this.container, this.model);
    // Enables tooltips, new connections and panning
    graph.setPanning(true);
    graph.setTooltips(true);
    graph.setConnectable(true);
    graph.setEnabled(true);
    graph.setEdgeLabelsMovable(false);
    graph.setVertexLabelsMovable(false);
    graph.setGridEnabled(true);
    graph.setAllowDanglingEdges(false);

    return graph;
  }
}
