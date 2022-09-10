import { IConnackPacket } from "mqtt";
import { HueGroupManager } from "../common/hue";
import {PushEvents, PushEvent} from "../common/hue-model";
import { CarouselOptions } from "../automation/automation-models";
import { AutomationHandler } from "./automation-handler";

export class AutomationHandlerToggle extends AutomationHandler{
    turnedOn: boolean;
    constructor(mqttTopic: string, private hue: HueGroupManager, private defaultScene: string){
        super(mqttTopic);
    }

    onConnect(packet: IConnackPacket): void {
        
    }

    async onMessage(message: any) {
        if(!await this.hue.isOn()){
            console.log("is off, turn on");
            this.hue.setScene(this.defaultScene);
            this.turnedOn = true;
        } else {
            console.log("is on, turn off");
            this.hue.turnOff();
        }
    }

}