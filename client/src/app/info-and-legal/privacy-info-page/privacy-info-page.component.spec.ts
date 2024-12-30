import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacyInfoPageComponent } from './privacy-info-page.component';

describe('PrivacyInfoPageComponent', () => {
  let component: PrivacyInfoPageComponent;
  let fixture: ComponentFixture<PrivacyInfoPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyInfoPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrivacyInfoPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
