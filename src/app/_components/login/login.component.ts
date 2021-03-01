import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../_service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: FormGroup = new FormGroup({});
  loading = false;
  submitted = false;
  returnUrl: string = '/homepage';
  returnUrlAdmin: string = '/homepage_admin';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private _auth: AuthService,
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this._auth.user.subscribe((user)=>{
      if (user.role === 'ADMIN') {
        this.router.navigate([this.returnUrlAdmin]);
      } else if(user.role === 'USER') {
        this.router.navigate([this.returnUrl]);
      }
    });
  }
  get f() { return this.form.controls; }


  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    } else {
      console.log('Form is valid');
    }

    this.loading = true;
    this._auth.login(this.f.username.value, this.f.password.value)
      // .pipe(first())
      .subscribe(
        data => {
          console.log("Authentication successfull", data);
          if (data.role === 'ADMIN') {
            this.router.navigate([this.returnUrlAdmin]);
          } else {
            this.router.navigate([this.returnUrl]);
          }
        },
        error => {
          // this.alertService.error(error);
          this.loading = false;
        });
  }
}
