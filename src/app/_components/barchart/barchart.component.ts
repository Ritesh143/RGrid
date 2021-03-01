import { Component, OnInit, Input } from '@angular/core';
import { ChartDataSets, ChartType } from 'chart.js';

@Component({
  selector: 'app-barchart',
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.css']
})
export class BarchartComponent implements OnInit {
    @Input() public barChartLabels: string[] = [];
    @Input() public barChartData: ChartDataSets[] = [];
    public barChartType: ChartType = 'bar';
    public barChartLegend = true;
    public barChartOptions = {
      scaleShowVerticalLines: false,
      responsive: true,
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    };

  constructor() { }
  ngOnInit() {
  }

  export_graph = <HTMLCanvasElement>document.getElementById("download");
  downloadLink: string = '';

  exportGraph(event: any){
    var anchor = event.target;
    anchor.href = document.getElementsByTagName('canvas')[0].toDataURL();
    // set the anchors 'download' attibute (name of the file to be downloaded)
    anchor.download = "test.png";
  }
}
