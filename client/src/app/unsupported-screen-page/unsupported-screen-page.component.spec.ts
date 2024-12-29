import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnsupportedScreenPageComponent } from './unsupported-screen-page.component';

describe('UnsupportedScreenPageComponent', () => {
  let component: UnsupportedScreenPageComponent;
  let fixture: ComponentFixture<UnsupportedScreenPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnsupportedScreenPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnsupportedScreenPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
