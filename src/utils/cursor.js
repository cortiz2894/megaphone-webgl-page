import { gsap } from 'gsap';
import { map, lerp, calcWinsize, getMousePos } from './utils';
import { EventEmitter } from 'events';

// Calculate the viewport size
let winsize = calcWinsize();
window.addEventListener('resize', () => {
    winsize = calcWinsize();
});

// Track the mouse position
let mouse = {x: 0, y: 0};
window.addEventListener('mousemove', ev => mouse = getMousePos(ev));

export default class Cursor extends EventEmitter {
    constructor(el) {
        super();
        this.DOM = {el: el};
        this.DOM.el.style.opacity = 0;
        this.DOM.el.style.stroke ='#efeae3'
        this.DOM.el.style.transition = 'fill-opacity 0.2s ease , stroke 0.2s ease'; 
        this.DOM.circleInner = this.DOM.el.querySelector('.cursor__inner');
        
        this.filterId = '#filter-1';
        this.DOM.feTurbulence = document.querySelector(`${this.filterId} > feTurbulence`);
        
        this.primitiveValues = {turbulence: 0};

        this.createTimeline();

        this.bounds = this.DOM.el.getBoundingClientRect();
        
        this.renderedStyles = {
            tx: {previous: 0, current: 0, amt: 0.2},
            ty: {previous: 0, current: 0, amt: 0.2},
            radius: {previous: 60, current: 20, amt: 0.2}
        };

        this.listen();

        this.onMouseMoveEv = () => {
            this.renderedStyles.tx.previous = this.renderedStyles.tx.current = mouse.x - this.bounds.width/2;
            this.renderedStyles.ty.previous = this.renderedStyles.ty.current = mouse.y - this.bounds.height/2;
            
            gsap.to(this.DOM.el, {duration: 0.9, ease: 'Power3.easeOut', opacity: 1});
            requestAnimationFrame(() => this.render());
            window.removeEventListener('mousemove', this.onMouseMoveEv);
        };
        window.addEventListener('mousemove', this.onMouseMoveEv);
    }
    render() {
        this.renderedStyles['tx'].current = mouse.x - this.bounds.width/2;
        this.renderedStyles['ty'].current = mouse.y - this.bounds.height/2;

        for (const key in this.renderedStyles ) {
            this.renderedStyles[key].previous = lerp(this.renderedStyles[key].previous, this.renderedStyles[key].current, this.renderedStyles[key].amt);
        }
                    
        this.DOM.el.style.transform = `translateX(${(this.renderedStyles['tx'].previous)}px) translateY(${this.renderedStyles['ty'].previous}px)`;
        this.DOM.circleInner.setAttribute('r', this.renderedStyles['radius'].previous);

        requestAnimationFrame(() => this.render());
    }
    createTimeline() {
        // init timeline
        this.tl = gsap.timeline({
            paused: true,
            onStart: () => {
                this.DOM.circleInner.style.filter = `url(${this.filterId}`;
            },
            onUpdate: () => {
                this.DOM.feTurbulence.setAttribute('baseFrequency', this.primitiveValues.turbulence);
            },
            onComplete: () => {
                this.DOM.circleInner.style.filter = 'none';
            }
        })
        .to(this.primitiveValues, { 
            duration: 0.4,
            startAt: {turbulence: 0.09},
            turbulence: 0
        });
    }
    enter() {
        this.renderedStyles['radius'].current = 100;
        // this.DOM.el.style.fillOpacity = 0
        this.tl.restart();
    }
    enterNav() {
        this.renderedStyles['radius'].current = 50;
        this.DOM.el.style.fillOpacity = 0
        this.DOM.el.style.stroke ='#000000'
        this.DOM.el.style.transition = 'fill-opacity 0s ease , stroke 0s ease'; 
        this.tl.restart();
    }
    leave() {
        this.renderedStyles['radius'].current = 20;
        this.DOM.el.style.stroke ='#efeae3'
        this.DOM.el.style.fillOpacity = 1
        this.tl.progress(1).kill();
    }
    listen() {
        this.on('enter', () => this.enter());
        this.on('enterNav', () => this.enterNav());
        this.on('leave', () => this.leave());
    }
}