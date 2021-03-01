import {Option} from  './option'

export class PollData {
    id!: string;
    question!: string;
    options!: Option[];
    _id: string| undefined;

}