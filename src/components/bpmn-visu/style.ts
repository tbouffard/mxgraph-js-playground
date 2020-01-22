import {css} from 'lit-element';

export default function(containerId) {
  return css`
      #${containerId} {
        touch-action: none;
      }
      #statusSlot::slotted(#status) {
        text-align: right;
        white-space: nowrap;
      }
      #statusSlot::slotted(#status), #graphSlot::slotted(#graph) {
        position: absolute;
        overflow: hidden;
        font-family: Arial;
        font-size: 8pt;
      }
      #graphSlot::slotted(#graph) {
        border-style: solid;
        border-color: #F2F2F2;
        border-width: 1px;
        background: url('images/grid.gif');
      }
    `;
}
