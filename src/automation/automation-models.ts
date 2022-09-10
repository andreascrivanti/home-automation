export class CarouselOptions {
    constructor(private carouselTime: number, private timeForConsecutiveClick: number, private shortClick: number){}
    getCarouselTime(): number{
        return this.carouselTime;
    }
    getTimeForConsecutiveClick(): number{
        return this.timeForConsecutiveClick;
    }
    getTimeForShortClick(): number{
        return this.shortClick;
    }
}