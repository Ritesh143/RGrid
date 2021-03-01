import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { PollData, User, Option } from '../../_models';
import { throwError } from 'rxjs';
import { AuthService } from '../../_service/auth.service';
import { Router } from '@angular/router';
import { SocketioService } from 'src/app/socketio.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  private pollData!: PollData;
  i!: number;
  public options: Option[] = new Array<Option>();
  public question: string = '';
  public alreadyVoted: string = '';
  public voteForm: FormGroup = new FormGroup({});
  public userInfo: User = new User;
  private loginUrl: string = '/login';

  constructor(
    private _fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private socketService: SocketioService
  ) { }

  ngOnInit(): void {
    this.auth.user.subscribe(user => {
      if (user && user.role === 'USER') {
        this.userInfo = user;
        this.alreadyVoted = '';
        this.voteForm = this._fb.group({
          voteOption: ['', Validators.required]
        });

        this.socketService.socket.emit('getpolldata');
        this.socketService.socket.on('polldataUpdate', (pollData: PollData) => {
          if (pollData.question)
            this.processform(pollData);
        });
      } else {
        this.router.navigate([this.loginUrl]);
      }
    });
  }
  // this will init/reset/update the form with the values.
  processform(data: PollData) {
    this.options = [];
    this.alreadyVoted = '';
    this.pollData = data;
    this.question = data.question;
    for (let itr of data.options) {
      this.options.push(itr);
      if (itr.votesBy.includes(this.userInfo.id)) {
        this.alreadyVoted = itr.name;
      }
    }
  }

  processError(err: { error: { message: string; }; status: any; message: any; }) {
    let message = '';
    if (err.error instanceof ErrorEvent) {
      message = err.error.message;
    } else {
      message = `Error Code: ${err.status}\nMessage: ${err.message}`;
    }
    console.log(message);
    return throwError(message);
  }

  submitForm(model: FormGroup) {
    var selectedOption = model.controls.voteOption.value;
    for (let itr in this.options) {
      if (this.options[itr].name === selectedOption) {
        this.pollData.options[itr].voteCount += 1;
        this.pollData.options[itr].votesBy.push(this.userInfo.id);
        break;
      }
    }
    this.alreadyVoted = selectedOption;
    this.socketService.socket.emit('savepolldata', this.pollData);
    alert('You have successfully voted for ' + selectedOption);
  }

  logout() {
    this.auth.logout();
  }
}
