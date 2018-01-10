(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) : factory();
}(this, (function () { 'use strict';


const slice = Array.prototype.slice;
// 自定义事件 类似 nodejs中的 EventEmitter
class EventEmitter {
    constructor(){
        // 克隆一份 事件
        this._monitor_ = Object.assign({}, this._monitor_ || {});
    }
    /**
     * 绑定事件
     * @param type 事件名称
     * @param fun 事件方法
     * @returns {EventEmitter}
     */
    on(type, fun) {
        let monitor = this._monitor_ || (this._monitor_ = {});
        monitor[type] || (monitor[type] = []);
        monitor[type].push(fun);
        return this;
    }

    /**
     * 判断是否还有特定事件
     * @param type
     * @returns {*}
     */
    hasEvent(type) {
        let monitor = this._monitor_ && this._monitor_[type] || [];
        return monitor.length > 0 || !!this['on' + type];
    }

    /**
     * 只有执行一次的事件
     * @param type 事件名称
     * @param fun 事件方法
     * @returns {EventEmitter}
     */
    onec(type, fun) {
        function funx() {
            fun.apply(this, arguments);
            this.off(type, funx);
        }
        this.on(type, funx);
        return this;
    }

    /**
     * 移除事件
     * @param type 事件名称
     * @param fun 事件方法
     * @returns {EventEmitter}
     */
    off(type, fun) {
        let monitor = this._monitor_;
        if (monitor) {
            if (fun) {
                let es = monitor[type];
                if (es) {
                    let index = es.indexOf(fun);
                    if (index > -1) {
                        es.splice(index, 1);
                    }
                }
            } else if (type) {
                delete monitor[type];
            } else {
                delete this._monitor_;
            }
        }
        return this;
    }

    /**
     * 触发事件
     * @param {String} type 事件名称
     * @param {*} ag 传递的参数
     */
    emit(type, ...ag) {
        let es = this._monitor_ && this._monitor_[type] || [];
        if (es.length) {
            for (let i = 0; i < es.length; i += 1) {
                es[i].apply(this, ag);
            }
        }
        let onFun = this['on' + type];
        onFun && onFun.apply(this, ag);
        return this;
    }

    /**
     * 扩展本身
     */
    assign(...args) {
        if(typeof args[0] === 'string'){
            this.assign({[args[0]]:args[1]})
        }
        else{
            args.unshift(this);
            Object.assign.apply(Object, args);
        }
        return this;
    }
}

// =================================基础Slip类===================================================

let doc = window.document

let isTouch = 'ontouchstart' in doc

let moveData

function getEventXY(ev){
    //移动是多点触控，默认使用第一个作为clientX和clientY
    if (ev.clientX == null) {
        let touches = ev.targetTouches && ev.targetTouches[0] ? ev.targetTouches : ev.changedTouches
        if (touches && touches[0]) {
            ev.clientX = touches[0].clientX
            ev.clientY = touches[0].clientY
            return [touches[0].clientX, touches[0].clientY]
        }
    }
    return [ev.clientX, ev.clientY]
}

let events = {
    move: isTouch? 'touchmove': 'mousemove',
    down: isTouch? 'touchstart': 'mousedown',
    up: isTouch? 'touchend': 'mouseup'
}
function appendEvent(dom, type, fn, cap){
    dom.addEventListener(events[type], fn, !!cap)
}
function removeEvent(dom, type, fn, cap){
    dom.removeEventListener(events[type], fn, !!cap)
}

function getMax(m, c){
    if(m == 0){
        return 0
    }
    if(m < 0){
        return c < m ? m : (c > 0 ? 0 : c)
    }
    return c > m ? m : (c < 0 ? 0 : c)
}

//鼠标移动开始
function slipDown(ev){
    if(moveData){
        return
    }
    moveData = this
    appendEvent(doc, 'move', slipMove, true)
    appendEvent(doc, 'up', slipUp, true)
    let [x, y] = getEventXY(ev)
    this.bx = this.ax - x
    this.by = this.ay - y
    this.emit('start', ev)
}

function getSlipData(ev){
    let [x, y] = getEventXY(ev)
    return [getMax(moveData.mx, x + moveData.bx), getMax(moveData.my, y + moveData.by)]
    //moveData.emit(type, mx, my, ev)
    //return [mx, my]
}

//鼠标移动中
function slipMove(evt){
    if(moveData){
        window.getSelection ? window.getSelection().removeAllRanges() : doc.selection.empty()
        moveData.emit('move', ...getSlipData(evt), evt)
    }
}

//鼠标抬起
function slipUp(evt){
    if(moveData){
        removeEvent(doc, 'up', slipUp, true)
        removeEvent(doc, 'move', slipMove, true)
        let [x, y] = getSlipData(evt)
        this.ax = x
        this.ay = y
        moveData.emit('end', x, y, evt)
        moveData = null
    }
}

class Slip extends EventEmitter {
    // 初始化
    constructor (id, mx, my) {
        super()

        this.dom = typeof id == 'string' ? doc.getElementById(id) : id
        this.ax = 0
        this.ay = 0

        this.mx = mx || -60
        this.my = my || 0

        appendEvent(this.dom, 'down', slipDown.bind(this))
    }

    // 清理
    setSkewing(x, y) {
        this.ax = getMax(this.mx, x || 0)
        this.ay = getMax(this.my, y || 0)
        return [this.ax, this.ay]
    }
}

// ===========================注册Vue指令=========================================================

let transformKeys = 'WebkitTransform,MozTransform,OTransform,MsTransform,transform'.split(',')
let transitionKeys = 'WebkitTransition,MozTransition,OTransition,MsTransform,transition'.split(',')


function setTransition(dom, t){
    let tStr = t > 0 ? 'transform ' + t + 'ms ease-out': 'none'
    transitionKeys.forEach(key => {
        // transform .35s ease-out
        dom.style[key] = tStr
    })
}

function setTranslate(dom, x, y, anim){
    transformKeys.forEach(key => {
        dom.style[key] = 'translate3d(' + x + 'px, ' + y + 'px, 0)'
    })
    if(anim){
        setTransition(dom, anim)
    }
    //dom.style.
}

function install(vue, named = 'slip'){

    let currSlip
    function closeCurr() {
        if(currSlip){
            currSlip.setTranslate()
            currSlip = null
        }
    }

    appendEvent(doc.documentElement, 'down', closeCurr)

    // 指令
    vue.directive(named, {
        bind: function(el, binding, vnode){
            let opt = binding.value || {}
            let mx = opt.mx || -60
            let my = opt.my || 0
            let auto = opt.auto === false ? 0 : (opt.auto || 100)
            let yStart = 0, isScroll = 0
            new Slip(el, mx, my)
            .on('start', function(event){
                if(auto){
                    setTransition(this.dom, 0)
                }
                yStart = event.clientY
                isScroll = 0
                if(currSlip && currSlip != this){
                    closeCurr()
                }
                event.stopPropagation()

                opt.start && opt.start(this, event)
            })
            .on('end', function(x, y, event){
                if(isScroll > 0){
                    return
                }
                if(auto){
                    let tx = Math.abs(x - this.tx) / Math.abs(mx) > .1 ? mx : 0
                    if(this.tx){
                        tx = tx == 0 ? mx : 0
                    }
                    this.tx = tx
                    let ty = Math.abs(y - this.ty) / Math.abs(my) > .1 ? my : 0
                    if(this.ty != 0){
                        ty = ty == 0 ? my : 0
                    }
                    this.ty = ty
                    setTranslate(this.dom, tx, ty, auto)
                    this.setSkewing(tx, ty)
                }
                currSlip = this
                opt.end && opt.end(this, event)
            })
            .on('move', function(x, y, event){
                if(isScroll == 0){
                    isScroll = Math.abs(event.clientY - yStart) > 5 ? 1 : -1
                }
                if(isScroll > 0){
                    return 
                }
                event.preventDefault()
                setTranslate(this.dom, x, y)
                opt.move && opt.move(this, x, y, evnet)
            }).assign({
                tx: 0,
                ty: 0,
                setTranslate (x, y) {
                    let [tx, ty] = this.setSkewing(x || 0, y || 0)
                    setTranslate(this.dom, tx, ty, auto)
                    this.tx = tx
                    this.ty = ty
                }
            })
        }
    })
}

if(window.Vue){
    install(window.Vue)
}

return {EventEmitter, Slip, install}

})))