import { IConnackPacket } from "mqtt";
import { HueGroupManager } from "../common/hue";
import {PushEvents, PushEvent} from "../common/hue-model";
import { CarouselOptions } from "../automation/automation-models";
import { AutomationHandler } from "./automation-handler";

export class AutomationHandlerCarousel extends AutomationHandler{
    startTs: number;
    pushEnd: boolean;
    isEnd: boolean;
    scenesList = [];
    sceneIndex = 0;
    turnedOn: boolean;
    pushHistory: PushEvents;
    constructor(mqttTopic: string, private hue: HueGroupManager, private config: CarouselOptions, private sceneFilters: string[], private defaultScene: string){
        super(mqttTopic);
        let pos = -1;
        for (let index = 0; index < sceneFilters.length; index++) {
            const element = sceneFilters[index];
            if(element.toLocaleLowerCase() == defaultScene.toLocaleLowerCase()){
                pos = index;
                break;
            }
        }
        if(pos > -1){
            this.sceneFilters.splice(pos, 1);
        }
        this.scenesList = hue.getScenes().map((x)=> x.getSceneName()).filter(this.getSceneFilterLambda());
        this.scenesList.sort(function(a: string, b: string): number{
            let aTokens = a.split(" ");
            let bTokens = b.split(" ");
            let firstNum = Number(aTokens[1]);
            let secondNum = Number(bTokens[1]);
            if(firstNum && secondNum){
                return firstNum - secondNum;
            } else{
                if(a == b){
                    return 0;
                } else if(a > b){
                    return 1;
                } else{
                    return -1;
                }
            }

        });
        
        this.scenesList.splice(0, 0, this.defaultScene);
        this.pushHistory = new PushEvents(config.getTimeForConsecutiveClick());
        console.log(JSON.stringify(this.scenesList));
    }

    getSceneFilterLambda(): (sceneName: string) => boolean{
        let lambda = (sceneName: string): boolean => {
            for (let index = 0; index < this.sceneFilters.length; index++) {
                const element = this.sceneFilters[index];
                if(element.startsWith("*") && sceneName.toLocaleLowerCase().endsWith(element.substr(1).toLocaleLowerCase())){
                    return true;
                } else if(element.endsWith("*") && sceneName.toLocaleLowerCase().startsWith(element.toLocaleLowerCase().substring(0, element.length - 1))){
                    return true;
                } else if(element.toLocaleLowerCase() == sceneName.toLocaleLowerCase()){
                    return true;
                }
            }
            return false;
        }
        return lambda;
        
    }

    async updateScenes() {
        await this.hue.updateScenes();
        this.scenesList = this.hue.getScenes().map((x)=> x.getSceneName()).filter(this.getSceneFilterLambda());
        this.scenesList.splice(0, 0, this.defaultScene);
        console.log("update scenes: " + JSON.stringify(this.scenesList));
    }

    onConnect(packet: IConnackPacket): void {
        
    }

    async onMessage(message: any) {
        if (message == '1'){
            this.isEnd = false;
            this.startTs = Date.now();
            if(!await this.hue.isOn()){
                this.sceneIndex = 0;
                this.hue.setScene(this.scenesList[this.sceneIndex]);
                this.turnedOn = true;
            }
            let interval = setInterval(()=>{
                if(!this.isEnd){
                    this.sceneIndex = this.sceneIndex + 1;
                    this.sceneIndex = this.sceneIndex % this.scenesList.length;
                    this.hue.setScene(this.scenesList[this.sceneIndex]);
                } else{
                    clearInterval(interval);
                }
            }, this.config.getCarouselTime())

        } else if(message == '0'){
            let time = Date.now() - this.startTs;
            this.pushHistory.addEvent(new PushEvent(new Date(), time));
            this.manageEvents();
            this.isEnd = true;
            
            if(await this.hue.isOn() && !this.turnedOn && time < this.config.getTimeForShortClick()){
                console.log("is on, turn off")
                this.hue.turnOff();
            }
            this.turnedOn = false;
        }
    }

    private manageEvents():void{
        //update scenes list on two short click
        let events = this.pushHistory.getEvents();
        if(events.length >= 2){
            if(events[events.length - 2].isShort() && events[events.length - 1].isShort()){
                this.updateScenes();
            }
        }
        
    }

}