import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartControlsComponent } from './cart-controls.component';

describe('CartControlsComponent', () => {
  let component: CartControlsComponent;
  let fixture: ComponentFixture<CartControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartControlsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
