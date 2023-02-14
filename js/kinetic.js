export class Animation {
    constructor(setter) {
        this.setter = setter;
        this.reset();
    }

    reset() {
        this.startTime = 0;
        this.startValue = 0;
        this.targetValue = 0;
        this.prevTime = 0;
        this.looping = false;
    }

    getValue(time) {
        var dt = time - this.startTime;
        var accel = this.targetValue === 0 ? 500 : 1000;
        if (this.targetValue > this.startValue) {
            return Math.min(this.startValue + dt / accel, this.targetValue);
        } else {
            return Math.max(this.startValue - dt / accel, this.targetValue);
        }
    }

    set(value) {
        if (value !== this.targetValue) {
            var time = performance.now();
            this.startValue = this.getValue(time);
            if (value * this.startValue < 0) {
                this.startValue = 0;
            }
            this.targetValue = value;
            this.startTime = time;
            if (!this.looping) {
                this.looping = true;
                this.prevTime = time;
                requestAnimationFrame(t => this.loop(t));
            }
        }
    }

    unset(value) {
        if (value === this.targetValue) {
            var time = performance.now();
            this.startValue = this.getValue(time);
            this.targetValue = 0;
            this.startTime = time;
        }
    }

    loop(time) {
        if (!this.looping) {
            return;
        }
        var value = this.getValue(time);
        this.setter(value, time - this.prevTime);
        this.prevTime = time;
        if (value === 0 && this.targetValue === 0) {
            this.looping = false;
        } else {
            requestAnimationFrame(t => this.loop(t));
        }
    }
}
