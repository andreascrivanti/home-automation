import { IConnackPacket } from "mqtt";

export abstract class AutomationHandler{
    constructor(private mqttTopic: string){}
    getMqttTopic(){
        return this.mqttTopic;
    }

    abstract onConnect(packet: IConnackPacket): void;
    abstract onMessage(message: any): void;
}