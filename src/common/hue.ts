import axios from 'axios';
import {Group, Groups, Scene} from './hue-model';
export class HueGroupManager {
    private prefix: string;
    private groupId: string;
    constructor(private urlPrefix: string, private group: Group){
        this.groupId = group.getGroupId();
        this.prefix = urlPrefix + "/groups/" + this.groupId;
    }

    async updateScenes(){
        try{
            const res = await axios.get(this.urlPrefix + "/scenes");
            const scenes = {};
            for (let key in res.data) {
                let name = res.data[key].name;
                let group = res.data[key].group;
                if(!(group in scenes)){
                    scenes[group] = [];
                }
                let scene = new Scene(key, name, group);
                scenes[group].push(scene);
            }
            
            this.group.setScenes(scenes[this.groupId]);
        }
        catch(err){

        }
    }

    setScene(sceneName: string){
        const sceneId = this.group.getSceneByName(sceneName).getSceneId();
        axios.put(this.prefix + "/action", {"scene":sceneId, "transitiontime":3}).then((res) => {
            console.log(res.status);
            if(res.status == 200){
                console.log("group " + this.group + " is on with scene '" + sceneName + "'");

            }
        });
    }

    setBrightnessIncrement(increment: number){
        axios.put(this.prefix + "/action", {"bri_inc":increment}).then((res) => {
            if(res.status == 200){

            }
        });
    }

    turnOff(){
        axios.put(this.prefix + "/action", {"on":false, "transitiontime":1}).then((res) => {
            console.log("group " + this.group + " is off");
        });
    }

    turnOn(){
        axios.put(this.prefix + "/action", {"on":true, "transitiontime":3}).then((res) => {
            console.log("group " + this.group + " is on");
        });
    }

    async isOn(){
        const res = await axios.get(this.prefix);
        console.log(JSON.stringify(res.data));
        let isOn = res.data["state"]["any_on"];
        return isOn;
    }

    getScenes(){
        return this.group.getScenes();
    }
    

}

export class HueGroupManagerFactory{
    private urlPrefix: string;
    private groups: Groups;

    constructor(private config: any){
        this.urlPrefix = "http://" + this.config.HUE_BRIDGE + "/api/" + this.config.HUE_USER;
    }

    async create(groupName: string): Promise<HueGroupManager>{
        if(!this.groups){
            await this.updateMaps();
        }
        let group = this.groups.getGroupByName(groupName)
        if(group != null){
            return new HueGroupManager(this.urlPrefix, group);
        } else{
            throw new Error("Group name '" + groupName + "' does not exist!");
        }
        
    }

    private async updateMaps(){
        console.log("Updating hue groups map...");
        try{
            const res = await axios.get(this.urlPrefix);
            const scenes = {};
            for (let key in res.data.scenes) {
                let name = res.data.scenes[key].name;
                let group = res.data.scenes[key].group;
                if(!(group in scenes)){
                    scenes[group] = [];
                }
                let scene = new Scene(key, name, group);
                scenes[group].push(scene);
            }
            const groups = [];
            
            for (let key in res.data.groups) {
                let name = res.data.groups[key].name;
                let isOn = res.data.groups[key].state.any_on;
                let group = new Group(key, name, scenes[key], isOn);
                if(this.groups && this.groups.getGroupById(group.getGroupId())){
                    this.groups.getGroupById(group.getGroupId()).setScenes(scenes[key]);
                }
                groups.push(group);
            }
            this.groups = new Groups(groups);
            console.log("group updated successfully");
        }
        catch(err){
            console.log("updated maps with errors " + JSON.stringify(err));
        }
    }


}
