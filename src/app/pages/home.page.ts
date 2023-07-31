import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `Test 123`,
})
export default class HomeComponent {
  count = 0;

  increment() {
    this.count++;
  }
}
