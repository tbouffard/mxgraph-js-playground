import {css} from 'lit-element';

export default function(containerId) {
  return css`
      #${containerId} {
        touch-action: none;
      }
      .mxRubberband {
        position: absolute;
        border: 1px dashed;
        background-color: rgba(100, 100, 100, 0.5);
      }
    `;
}
