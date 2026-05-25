import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-portal.component.html',
  styleUrls: ['./login-portal.component.css']
})
export class LoginPortalComponent {
  @Input() logo!: string;
  @Input() isActive = false;
  @Input() loginUser = 'customer01';
  @Input() loginPass = '123456';
  @Output() login = new EventEmitter<{user: string, pass: string}>();

  onLogin(): void {
    this.login.emit({ user: this.loginUser, pass: this.loginPass });
  }
}
