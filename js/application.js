// Shell <creative>
// <02 October 2018>

let
    $_PARAMS,
    mainVideoURL,
    tracker = new TimeTracker(),
    addV5Statistics = (function () {
        let mainVidData = [
            {QUARTILE_SENT: false, constantValue: EVENT_VIDEO_IMPRESSION},
            {QUARTILE_SENT: false, constantValue: EVENT_VIDEO_QUARTILE_1},
            {QUARTILE_SENT: false, constantValue: EVENT_VIDEO_QUARTILE_2},
            {QUARTILE_SENT: false, constantValue: EVENT_VIDEO_QUARTILE_3},
            {QUARTILE_SENT: false, constantValue: EVENT_VIDEO_QUARTILE_4}
        ];

        return function (QUARTILE_INDEX) {
            if (mainVidData[QUARTILE_INDEX].QUARTILE_SENT) return false;

            console.log('Custom: Sending QUARTILE:', mainVidData[QUARTILE_INDEX].constantValue);
            v5ViPlusCustomProxy.dispatchEvent("VP_CUSTOM_IFRAME_VIPLUSEVENT", {
                event: mainVidData[QUARTILE_INDEX].constantValue
            });

            return mainVidData[QUARTILE_INDEX].QUARTILE_SENT = true;
        }
    })();


const app = new Vue({
    el: '#app',
    data: {
        timerId: undefined,
        userActive: false,
        btnAnimated: false,
        mainVidTime: 0,
        cards: [{animate: false}, {animate: false}, {animate: false}, {animate: false}],
        videos: [
            {display: false, link: 'https://s.5visions.com/v/120002884_w640.mp4'},
            {display: false, link: 'https://s.5visions.com/v/120002883_w640.mp4'},
            {display: false, link: 'https://s.5visions.com/v/120002882_w640.mp4'},
            {display: false, link: 'https://s.5visions.com/v/120002885_w640.mp4'}
        ]
    },
    methods: {
        showVideo: function (index, paramName, ev) {
            // Display video by the transferred index
            // as a parameter

            this.userActive = true;

            this.$el.querySelector('.pgsBar').style.width = "0";
            clearInterval(this.timerId);
            tracker.startTrackingEarned(); // доп. время

            if (!isNaN(index) && (0 <= index < 4)) {

                this.videos.forEach(function (vid, i) {
                    vid.display = i === index;
                });

                v5ViPlusCustomProxy.dispatchEvent("VP_CUSTOM_IFRAME_VIDEOSLOT_CHANGE", {
                    src: this.videos[index].link,
                    currentTime: 0,
                    autoplay: 1
                });

                wrapV5Action(ev, false, paramName, true);
            }

        },

        knowMore: function (ev, paramName) {
            // console.log('BTN click');
            wrapV5Action(ev, true, paramName, true, {});
        },

        clickInteractive: function (ev, paramName) {
            // console.log('clickInteractive');
            wrapV5Action(ev, true, paramName, true, {});
        },

        mouseEnter: function (ev, index, paramName) {
            let
                currentTick = 0,
                $openBtnProgressBar = this.$el.querySelector('.pgsBar'),
                self = this;

            $openBtnProgressBar.style.width = "0";
            this.timerId = setInterval(makeProgress, 200);

            function makeProgress() {
                ++currentTick;
                if (currentTick <= 15) {
                    $openBtnProgressBar.style.width = Math.ceil(100 / 15 * currentTick) + "%";
                } else {
                    // success with hover
                    clearInterval(self.timerId);
                    $openBtnProgressBar.style.width = "0";
                    self.showVideo(index, paramName, ev);
                }
            }
        },

        mouseLeave: function (ev) {
            let $openBtnProgressBar = this.$el.querySelector('.pgsBar');
            $openBtnProgressBar.style.width = "0";

            clearInterval(this.timerId);
        },

        clickOnVideo: function (ev) {
            // console.log('Click on video');
            // If main video is displayed
            if (!this.notMainVideo) wrapV5Action(ev, true, 'Click_Video', true, {isMainVideo: true});
            // If any other video is playing
            if (this.videos[0].display) wrapV5Action(ev, true, 'Click_Video_Pay', true, {});
            if (this.videos[1].display) wrapV5Action(ev, true, 'Click_Video_gas_station', true, {});
            if (this.videos[2].display) wrapV5Action(ev, true, 'Click_Video_Card', true, {});
            if (this.videos[3].display) wrapV5Action(ev, true, 'Click_Video_wheel', true, {});
        },

        closeVideo: function (ev) {
            this.showMainVideo(this.mainVidTime);
            wrapV5Action(ev, false, 'Click_close', false);
        },

        showMainVideo: function (time) {
            tracker.startTrackingPaid(); // оплаченное время

            // Imitate main video (play first immediately)
            v5ViPlusCustomProxy.dispatchEvent("VP_CUSTOM_IFRAME_VIDEOSLOT_CHANGE", {
                src: 'https://s.5visions.com/v/120002895_w640.mp4',
                currentTime: time || 0,
                autoplay: 1
            });

            this.videos.forEach(item => {
                item.display = false;
            });
        },

        hoverOn: function (index) {
            this.cards[index].animate = true;
        },

        animationIteration: function (ev) {
            let image = ev.target || ev.srcElement;
            this.cards[image.localIndex].animate = false;
        },

        btnAnimationHandler: function (ev) {
            let target = ev.target || ev.srcElement;
            this.btnAnimated = false;
        }
    },
    computed: {
        notMainVideo: function () {
            return this.videos.some(item => {
                return item.display
            });
        }
    },
    mounted: function () {
        this.$nextTick(function () {
            // Код, который будет запущен только после
            // обновления всех представлений

            let elements = [].slice.call(document.querySelectorAll('.app__dashboard-cardHolder img.grayscale')),
                btn = document.querySelector('.app__block-btn');

            elements.forEach((image, index) => {
                image.localIndex = index;
                image.addEventListener('webkitAnimationIteration', this.animationIteration, false);
                image.addEventListener('animationiteration', this.animationIteration, false);
            });

            btn.addEventListener('webkitAnimationIteration', this.btnAnimationHandler, false);
            btn.addEventListener('animationiteration', this.btnAnimationHandler, false);

        });
    }
});


// -- v5 Framework scripts --
v5ViPlusCustomProxy.addEventListener("VP_CUSTOM_IFRAME_CONFIG_PARAMS", function (parameters) {
    /*
        Getting JSON parameters into the global variable
    */
    $_PARAMS = parameters;
    // console.log("Parameters from v5:", $_PARAMS);
});

v5ViPlusCustomProxy.addEventListener("VP_CUSTOM_IFRAME_CONFIG_MAINVIDEOCLICKTHRU", function (parameters) {
    mainVideoURL = parameters.url;
    // console.log("Main video link:", mainVideoURL);
});

// get started v5Framework and launch video
v5ViPlusCustomProxy.dispatchEvent("VP_CUSTOM_IFRAME_MANUAL_TIME_TRACKING");
v5ViPlusCustomProxy.dispatchEvent("VP_CUSTOM_IFRAME_READY");
app.showMainVideo();
addV5Statistics(0);

let firstEmbeddedTracker = new EmbeddedVidDispatcher(['Start_Video_Pay', 'View_1quartile_Pay', 'View_2quartile_Pay', 'View_3quartile_Pay', 'View_4quartile_Pay']),
    secondEmbeddedTracker = new EmbeddedVidDispatcher(["Start_Video_gas_station", "View_1quartile_gas_station", "View_2quartile_gas_station", "View_3quartile_gas_station", "View_4quartile_gas_station"]),
    thirdEmbeddedTracker = new EmbeddedVidDispatcher(["Start_Video_Card", "View_1quartile_Card", "View_2quartile_Card", "View_3quartile_Card", "View_4quartile_Card"]),
    fourthEmbeddedTracker = new EmbeddedVidDispatcher(["Start_Video_wheel", "View_1quartile_wheel", "View_2quartile_wheel", "View_3quartile_wheel", "View_4quartile_wheel"]);

let animateButton = (function (num) {
    return function () {
        if (num === 0) app.btnAnimated = true;
        ++num;
    }
})(0);

// Subscribe for the time since creative has started
v5ViPlusCustomProxy.addEventListener("VP_CUSTOM_IFRAME_TIME", function (params) {
    let time = params.time;

    // If time's equal or more than 3 seconds regardless of playing video
    if (time >= 3) animateButton();
});

// Subscribe for video slot current time
v5ViPlusCustomProxy.addEventListener("VP_CUSTOM_IFRAME_VIDEOSLOT_CURRENTTIME", function (params) {
    let currentTime = Math.floor(params.currentTime);

    // If main video is displayed out now
    if (!app.notMainVideo) {
        if (currentTime >= 5) addV5Statistics(1);
        if (currentTime >= 10) addV5Statistics(2);
        if (currentTime >= 15) addV5Statistics(3);
        if (currentTime >= 20) addV5Statistics(4);
        // Save watched segment of time
        app.mainVidTime = params.currentTime;
    }

    // If first embedded video is displayed
    // Duration: 15s
    if (app.videos[0].display) {
        if (currentTime >= 0) firstEmbeddedTracker.dispatch('Start_Video_Pay', event);
        if (currentTime >= 3.75) firstEmbeddedTracker.dispatch('View_1quartile_Pay', event);
        if (currentTime >= 7.5) firstEmbeddedTracker.dispatch('View_2quartile_Pay', event);
        if (currentTime >= 11.25) firstEmbeddedTracker.dispatch('View_3quartile_Pay', event);
        if (currentTime >= 15) firstEmbeddedTracker.dispatch('View_4quartile_Pay', event);
    }

    // If second embedded video is displayed
    // Duration: 15s
    if (app.videos[1].display) {
        if (currentTime >= 0) secondEmbeddedTracker.dispatch('Start_Video_gas_station', event);
        if (currentTime >= 3.75) secondEmbeddedTracker.dispatch('View_1quartile_gas_station', event);
        if (currentTime >= 7.5) secondEmbeddedTracker.dispatch('View_2quartile_gas_station', event);
        if (currentTime >= 11.25) secondEmbeddedTracker.dispatch('View_3quartile_gas_station', event);
        if (currentTime >= 15) secondEmbeddedTracker.dispatch('View_4quartile_gas_station', event);
    }

    // If third embedded video is displayed
    // Duration: 15s
    if (app.videos[2].display) {
        if (currentTime >= 0) thirdEmbeddedTracker.dispatch('Start_Video_Card', event);
        if (currentTime >= 3.75) thirdEmbeddedTracker.dispatch('View_1quartile_Card', event);
        if (currentTime >= 7.5) thirdEmbeddedTracker.dispatch('View_2quartile_Card', event);
        if (currentTime >= 11.25) thirdEmbeddedTracker.dispatch('View_3quartile_Card', event);
        if (currentTime >= 15) thirdEmbeddedTracker.dispatch('View_4quartile_Card', event);
    }

    // If fourth embedded video is displayed
    // Duration: 15s
    if (app.videos[3].display) {
        if (currentTime >= 0) fourthEmbeddedTracker.dispatch('Start_Video_wheel', event);
        if (currentTime >= 3.75) fourthEmbeddedTracker.dispatch('View_1quartile_wheel', event);
        if (currentTime >= 7.5) fourthEmbeddedTracker.dispatch('View_2quartile_wheel', event);
        if (currentTime >= 11.25) fourthEmbeddedTracker.dispatch('View_3quartile_wheel', event);
        if (currentTime >= 15) fourthEmbeddedTracker.dispatch('View_4quartile_wheel', event);
    }

});


v5ViPlusCustomProxy.addEventListener("VP_CUSTOM_IFRAME_PAUSE", function () {
    v5ViPlusCustomProxy.dispatchEvent("VP_CUSTOM_IFRAME_VIDEOSLOT_PAUSE");
    tracker.stopTrackingAnyTime();
});

v5ViPlusCustomProxy.addEventListener("VP_CUSTOM_IFRAME_RESUME", function () {
    v5ViPlusCustomProxy.dispatchEvent("VP_CUSTOM_IFRAME_VIDEOSLOT_PLAY");
    if (app.notMainVideo) tracker.startTrackingEarned();
    else tracker.startTrackingPaid();
});

v5ViPlusCustomProxy.addEventListener("VP_CUSTOM_IFRAME_VIDEOSLOT_ENDED", function () {
    v5ViPlusCustomProxy.dispatchEvent("VP_CUSTOM_IFRAME_STOP");
    tracker.stopTrackingAnyTime();
});

function wrapV5Action(event, redirect, paramName, isEffective, externalPassObject) {
    event.stopPropagation(); // constantly

    if (redirect) window.open($_PARAMS[paramName], "_blank");
    let eventType = isEffective ? EVENT_ACTIVE : EVENT_ACTIVE_NOTEFFECTIVE;

    v5ViPlusCustomProxy.dispatchEvent("VP_CUSTOM_IFRAME_VIPLUSEVENT", {
        event: eventType,
        params: {answers: paramName}
    });

    if (externalPassObject) {  // if user has gone by URL
        if (externalPassObject.isMainVideo)
            v5ViPlusCustomProxy.dispatchEvent("VP_CUSTOM_IFRAME_CLICKTHRU", {clickOnMainVideo: 1});
        else
            v5ViPlusCustomProxy.dispatchEvent("VP_CUSTOM_IFRAME_CLICKTHRU");
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function TimeTracker() {

    let data = {
        trackedPAID: false,
        trackedEARNED: false
    };

    // оплаченное время
    this.startTrackingPaid = function () {
        if (data.trackedPAID) return false;

        if (data.trackedEARNED) {
            v5ViPlusCustomProxy.dispatchEvent("VP_CUSTOM_IFRAME_PAUSE_TIME_TRACKING");
            data.trackedEARNED = false;
        }

        v5ViPlusCustomProxy.dispatchEvent("VP_CUSTOM_IFRAME_START_TIME_TRACKING", {
            type: TIMETRACKING_PAID
        });

        console.log('Tracking PAID time');
        data.trackedPAID = true;
    };

    // дополнительное время
    this.startTrackingEarned = function () {
        if (data.trackedEARNED) return false;

        if (data.trackedPAID) {
            v5ViPlusCustomProxy.dispatchEvent("VP_CUSTOM_IFRAME_PAUSE_TIME_TRACKING");
            data.trackedPAID = false;
        }

        v5ViPlusCustomProxy.dispatchEvent("VP_CUSTOM_IFRAME_START_TIME_TRACKING", {
            type: TIMETRACKING_EARNED
        });

        console.log('Tracking EARNED time');
        data.trackedEARNED = true;
    };

    // stop tracking time
    this.stopTrackingAnyTime = function () {
        v5ViPlusCustomProxy.dispatchEvent("VP_CUSTOM_IFRAME_PAUSE_TIME_TRACKING");
        console.log('Time track has stopped');
        data.trackedPAID = false;
        data.trackedEARNED = false;
    };

}

function EmbeddedVidDispatcher(eventsArr) {
    this.dispatch = function (eventName, ev) {
        // If array contains transferred event name
        if (~eventsArr.indexOf(eventName)) {
            console.log(eventName + ' sent');
            wrapV5Action(ev, false, eventName, false);
            eventsArr.splice(eventsArr.indexOf(eventName), 1);
        } else
            return false;
    }
}