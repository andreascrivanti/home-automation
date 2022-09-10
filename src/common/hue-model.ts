export class Scene{
    constructor(private sceneId: string, private sceneName: string, private groupId: string) {

    }

    getSceneId(){
        return this.sceneId;
    }
    getSceneName(){
        return this.sceneName;
    }
    getGroupId(){
        return this.groupId;
    }
}

export class Group{
    constructor(private groupId: string, private groupName: string, private scenes: Scene[], private on: boolean){

    }

    getGroupId(){
        return this.groupId;
    }
    getGroupName(){
        return this.groupName;
    }
    getSceneByName(sceneName: string){
        for (let scene of this.scenes){
            if(scene.getSceneName() === sceneName){
                return scene;
            }
        }
        return null;
    }
    getScenes(){
        return this.scenes;
    }
    setScenes(scenes: Scene[]){
        this.scenes = scenes;
    }
    setOn(on: boolean){
        this.on = on;
    }
    isOn(){
        return this.on;
    }
    toString(){
        return this.groupId + " - " + this.groupName;
    }
    

}

export class Groups{
    constructor(private groups: Group[]){

    }
    getGroupByName(groupName: string){
        for (let g of this.groups){
            if(g.getGroupName().toLocaleLowerCase() == groupName.toLocaleLowerCase()){
                return g;
            }
        }
        return null;
    }
    getGroupById(groupId: string){
        for (let g of this.groups){
            if(g.getGroupId() == groupId){
                return g;
            }
        }
        return null;
    }
}

export class PushEvent{
    constructor(private date: Date, private duration: number){

    }
    getDate(): Date{
        return this.date;
    }
    getDuration(): number{
        return this.duration;
    }
    isShort(): boolean{
        return this.duration <= 500;
    }
}

export class PushEvents{
    private events: PushEvent[];
    constructor(private maxMsBetweenPushes: number){
        this.events = [];
    };

    addEvent(event: PushEvent){
        let lastEvent = this.getLastEvent();
        if(lastEvent){
            let distance = event.getDate().getMilliseconds() - lastEvent.getDate().getMilliseconds() + lastEvent.getDuration();
            if(distance > this.maxMsBetweenPushes){
                this.events.splice(0, this.events.length);
            }
        }
        this.events.push(event);
    }

    private getLastEvent(): PushEvent {
        if (this.events.length > 0){
            return this.events[this.events.length - 1];
        } else{
            return null;
        }
    }

    public getEvents(): PushEvent[]{
        return this.events;
    }
}
