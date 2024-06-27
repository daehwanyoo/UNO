import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-color-selection-dialog',
  template: `
    <div class="dialog-overlay">
      <div class="dialog">
        <h3>Choose a Color</h3>
        <div class="color-options">
          <button (click)="selectColor('red')" class="color-button red">Red</button>
          <button (click)="selectColor('yellow')" class="color-button yellow">Yellow</button>
          <button (click)="selectColor('green')" class="color-button green">Green</button>
          <button (click)="selectColor('blue')" class="color-button blue">Blue</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .dialog {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .color-options {
      display: flex;
      justify-content: space-around;
      margin-top: 10px;
    }

    .color-button {
      width: 60px;
      height: 60px;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      outline: none;
    }

    .color-button.red { background: red; }
    .color-button.yellow { background: yellow; }
    .color-button.green { background: green; }
    .color-button.blue { background: blue; }
  `],
  standalone: true,
})
export class ColorSelectionDialogComponent {
  @Output() colorSelected = new EventEmitter<string>();

  selectColor(color: string) {
    this.colorSelected.emit(color);
  }
}
