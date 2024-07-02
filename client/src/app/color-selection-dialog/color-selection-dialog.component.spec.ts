import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorSelectionDialogComponent } from './color-selection-dialog.component';

describe('ColorSelectionDialogComponent', () => {
  let component: ColorSelectionDialogComponent;
  let fixture: ComponentFixture<ColorSelectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorSelectionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColorSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
