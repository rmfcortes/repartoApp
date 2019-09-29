import { Component, OnInit, Input } from '@angular/core';
import { Mensaje } from 'src/app/interfaces/chat.interface';

@Component({
  selector: 'app-bubbles',
  templateUrl: './bubbles.component.html',
  styleUrls: ['./bubbles.component.scss'],
})

export class BubblesComponent implements OnInit {

  @Input() msg: Mensaje;
  @Input() last: boolean;
  @Input() status: string;

  constructor() { }

  ngOnInit() {}

}
