import {css} from 'lit-element';

export default function(containerId) {
  return css`
      #${containerId} {
        position: absolute;
        top: 130px;
        right: 10px;
        bottom: 10px;
        left: 10px;
        overflow: hidden;
        cursor: default;
        touch-action: none;
      }
      .mxRubberband {
        position: absolute;
        border: 1px dashed;
        background-color: rgba(100, 100, 100, 0.5);
      }
    `;
}
