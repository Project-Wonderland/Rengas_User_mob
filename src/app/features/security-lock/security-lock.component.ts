import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-security-lock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './security-lock.component.html',
  styleUrls: ['./security-lock.component.css']
})
export class SecurityLockComponent {
  @Input() logo!: string;
  @Input() isActive = false;
  @Output() unlock = new EventEmitter<void>();

  loginPass = '';

  onUnlock(): void {
    this.unlock.emit();
  }
}
