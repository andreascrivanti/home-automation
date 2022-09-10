import { AutomationHandlerCarousel } from "./automation/automation-handler-carousel";
import { AutomationManager } from "./automation/automation-manager";
import { HueGroupManagerFactory } from "./common/hue";
import {CarouselOptions} from "./automation/automation-models";
import config from "./config/config.json";
import { AutomationHandlerToggle } from "./automation/automation-handler-toggle";

const hueFactory = new HueGroupManagerFactory(config);

const foo = async() => {
    const handlers = [];
    for (let i=0; i<config.automation_handlers.length; i++){
        let x = config.automation_handlers[i];
        let handlerType = x.handler_type;
        let handlerName = x.handler_name;
        let lightGroupName = x.light_group_name;

        switch (handlerType) {
            case "carousel":
                let ct = x.overrides.carousel_time;
                let cct = x.overrides.consecutive_click_time;
                let sc = x.overrides.short_click;
                if (ct == null){
                    ct = config.handlers_type_configuration.carousel.carousel_time;
                }
                if(cct == null){
                    cct = config.handlers_type_configuration.carousel.consecutive_click_time;
                }
                if(sc == null){
                    sc = config.handlers_type_configuration.carousel.short_click;
                }
                let options = new CarouselOptions(ct, cct, sc);
                let lightGroup = await hueFactory.create(x.light_group_name);
                let handler = new AutomationHandlerCarousel(x.mqtt_topic, lightGroup, options, x.scene_template, x.scene_default);
                handlers.push(handler);
                break;
            case "toggle":
                let toggleLightGroup = await hueFactory.create(x.light_group_name);
                let toggleHandler = new AutomationHandlerToggle(x.mqtt_topic, toggleLightGroup, x.scene_default);
                handlers.push(toggleHandler);
            default:
                break;
        }
    }
    // const hueLivingroom = await hueFactory.create("1");
    // const hueBathroom = await hueFactory.create("2");
    // // const handlerLivingroom = new AutomationHandlerLivingroom("shellies/push-living/input_event/0", hueLivingroom);
    // const handlerBathroomInt = new AutomationHandlerBathroom("shellies/bathroom-int/input/0", hueBathroom, config, ["doccia*"], "default");
    // const handlerBathroomExt = new AutomationHandlerBathroom("shellies/bathroom-ext/input/0", hueBathroom, config, ["doccia*"], "default");
    // const handlerLivingroom = new AutomationHandlerLivingroom("shellies/push-living/input/0", hueLivingroom, config, ["int*"], "def 1 mattino");
    
    const automationManager = new AutomationManager(config, handlers);
    automationManager.startUp();
};
foo();


