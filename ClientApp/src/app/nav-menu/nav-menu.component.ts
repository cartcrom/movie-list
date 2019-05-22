import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent {
  isExpanded = false;
  @Input() listNames: string[];

  @Output() selectList: EventEmitter<number> = new EventEmitter();
  @Output() newList: EventEmitter<null> = new EventEmitter();

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }

  changeClicked(i: number) {
    this.selectList.emit(i);
  }

  addClicked() {
    this.newList.emit(null);
  }
}
