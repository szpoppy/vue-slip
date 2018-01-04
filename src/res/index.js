var app = new Vue({
    el: '#app',
    data: {
        list: [
            {
                txt: '右向左滑动1',
                mx: -66
            },
            {
                txt: '左向右滑动1',
                mx: 66
            },
            {
                txt: '右向左滑动2',
                mx: -66
            },
            {
                txt: '左向右滑动2',
                mx: 66
            },
            {
                txt: '右向左滑动3',
                mx: -66
            },
            {
                txt: '左向右滑动3',
                mx: 66
            }
        ]
    },
    methods: {
        endSlip (slp, opt, event) {
            console.log('endSlip', slp, opt, event)
        }
    }
})