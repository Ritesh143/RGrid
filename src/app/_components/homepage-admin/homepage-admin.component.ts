import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../_service/auth.service';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { PollData, Option, User } from 'src/app/_models';
import { ChartDataSets } from 'chart.js';
import { Router } from '@angular/router';
import { SocketioService } from 'src/app/socketio.service';

@Component({
  selector: 'app-homepage-admin',
  templateUrl: './homepage-admin.component.html',
  styleUrls: ['./homepage-admin.component.css']
})
export class HomepageAdminComponent implements OnInit {
  public fbForm!: FormGroup;
  public currentRoute!: string;
  public minOptions: number = 2;
  private pollData: PollData = new PollData;
  private updatedData: PollData = new PollData;
  public recordID = {};  // {poll: .., result: ..}
  public chartEmpty: boolean = true;
  public chartLabels: string[] = [];
  public chartData: ChartDataSets[] = [];
  public staticOptions: string[] = [];
  private options: Option[] = new Array<Option>();
  public question: string = '';
  private loginUrl: string = '/login';
  public userInfo: User = new User;

  constructor(
    private _fb: FormBuilder,
    private _auth: AuthService,
    private router: Router,
    private socketService: SocketioService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this._auth.user.subscribe(user => {
      if (user && user.role === 'ADMIN') {
        this.userInfo = user;
        this.socketService.socket.emit('getpolldata');
        this.socketService.socket.on('polldataUpdate', (pollData: PollData) => {
          console.log("On polldataUpdate event triggered");
          this.getAndProcessPollData(pollData);
        });
      } else {
        this.router.navigate([this.loginUrl]);
      }
    });
  }
  // this will init/reset/update the form with their values.
  getAndProcessPollData(data: PollData): void {
    // this.http.get<PollData>(`http://localhost:3000/polldata`).subscribe((data) => {
    this.buildForm();
    this.staticOptions = []
    this.options = [];
    if (data==null || data.id == undefined) {
      this.currentRoute = 'new';
      this.addOption();
    } else {
      this.currentRoute = 'edit';
      this.pollData = data;
      this.fbForm.patchValue({ question: data.question });
      this.fbForm.get('question')!.disable();
      const control = <FormArray>this.fbForm.controls['options'];
      for (let itr of data.options) {
        control.push(this._fb.group({
          name: itr.name,
          voteCount: itr.voteCount,
          votesBy: [itr.votesBy] || [],
        }));
        this.staticOptions.push(itr.name);
      };
      this.initChart(false);
    }
  }
  //initialise and assign the values to the chart
  initChart(chartIsEmpty: boolean): void {
    this.chartEmpty = chartIsEmpty;
    this.chartLabels = [];
    this.chartData = [];
    for (let option of this.staticOptions) {
      this.chartLabels.push(option);
      let tempChartData: number[] = [];
      for (let itr of this.pollData.options) {
        if (option === itr.name) {
          tempChartData.push(itr.voteCount);
        } else {
          tempChartData.push(0);
        }
      }
      this.chartData.push({ data: tempChartData, label: option });
    }
  }
  // initialise a form
  buildForm() {
    this.fbForm = this._fb.group({
      question!: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(72)]],
      options: this._fb.array([
      ]),
      _id: null
    });
  }

  initOptions() {
    return this._fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(72)]],
      voteCount: [0, Validators.required],
      votesBy: this._fb.array([])
    });
  }
  // add new the array object into the form element
  addOption() {
    const control = <FormArray>this.fbForm.controls['options'];
    control.push(this.initOptions());
  }
  // remove the array field from the form element
  removeOption(i: number) {
    const control = <FormArray>this.fbForm.controls['options'];
    control.removeAt(i);
  }
  //saves the data and triggers bi-directional communication by triggering events.
  save(model: FormGroup) {
    for (let formGroup of model.controls.options.value) {
      if (this.pollData.options != null) {
        var temp = this.pollData.options.find((poll: Option) => {
          return poll.name === formGroup.name;
        });
      }
      if (temp == null) {
        if(formGroup.votesBy == null){
          formGroup.votesBy = [];
        }
        this.options.push(formGroup);
      } else {
        this.options.push(temp);
      }
    }
    this.updatedData = {
      options: this.options,
      question: model.controls.question.value,
      id: "1",
      _id: this.pollData._id,
    };

    this.socketService.socket.emit('savepolldata', this.updatedData);
    alert('You have successfully updated the poll.');
  }

  logout() {
    this._auth.logout();
  }
  // fix for keeping the focus inside the textfield
  trackByFn(index: any, item: any) {
    return item;
  }
}