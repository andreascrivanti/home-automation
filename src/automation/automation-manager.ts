import {connect, IConnackPacket, IClientOptions} from 'mqtt';
import { AutomationHandler } from "./automation-handler";

export class AutomationManager{
    constructor(private config: any, private handlers: AutomationHandler[]){}

    startUp(){
        const opt: IClientOptions = {username: this.config.MQTT_USER, password: this.config.MQTT_PWD};
        const client = connect(this.config.MQTT_BROKER, opt);
        const handlersObj = {};
        const handlerLastTopic = {};
        for (let ah of this.handlers){
            handlersObj[ah.getMqttTopic()] = ah;
        }

        client.subscribe(Object.keys(handlersObj), (err, granted) => {
            granted.forEach(({topic, qos}) => {
                console.log(`subscribed to ${topic} with qos=${qos}`)
                handlerLastTopic[topic] = 0;
            })
        }).on('message', (topic: string, payload: Buffer) => {
            const msg = JSON.parse(payload.toString());
            // console.log("new msg: " + JSON.stringify(msg));
            // console.log("old msg: " + JSON.stringify(handlerLastTopic[topic]));
            
            if(handlerLastTopic[topic] == null){
                handlerLastTopic[topic] = msg;
            } else if (JSON.stringify(handlerLastTopic[topic]) != JSON.stringify(msg)){
                handlerLastTopic[topic] = msg;
                handlersObj[topic].onMessage(msg);
            }
        }).on('connect', (packet: IConnackPacket) => {
            console.log('connected!', JSON.stringify(packet))

        })
    }
}