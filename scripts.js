/* Constants */
var LAUNCH_TIME_UTC = new Date('2026-04-01T22:35:12Z');
var CLOCK_STOP_TIME_UTC = new Date('2026-04-11T00:21:00Z');
var CST_OFFSET_MS = 6 * 60 * 60 * 1000;
var CLOCK_TICK_MS = 1000;
var PANEL_TITLE_RESHOW_DELAY_MS = 2000;

/* Player Config */
var PLAYER_CONFIGS = [
  {
    elementId: 'player-top-right',
    videoId: 'm3kR2KK8TEs',
    onReady: function (player) {
      player.unMute();
      player.setVolume(100);
    },
  },
  {
    elementId: 'player-bottom-right',
    videoId: '6RwfNBtepa4',
    onReady: function (player) {
      player.mute();
    },
  },
];

/* Startup */
loadYouTubeIframeApi();
bindPanelTitleHover();
startMissionClock();

/* App Setup */
function loadYouTubeIframeApi() {
  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

function bindPanelTitleHover() {
  document.querySelectorAll('.panel').forEach(function (panel) {
    var title = panel.querySelector('.panel-title');
    var reshowTimeoutId;
    if (!title) return;

    panel.addEventListener('mouseenter', function () {
      window.clearTimeout(reshowTimeoutId);
      title.classList.add('is-hidden');
    });

    panel.addEventListener('mouseleave', function () {
      window.clearTimeout(reshowTimeoutId);
      reshowTimeoutId = window.setTimeout(function () {
        title.classList.remove('is-hidden');
      }, PANEL_TITLE_RESHOW_DELAY_MS);
    });
  });
}

/* Mission Clocks */
function startMissionClock() {
  updateMissionClocks();
  window.setInterval(updateMissionClocks, CLOCK_TICK_MS);
}

function updateMissionClocks() {
  var missionTime = document.getElementById('mission-time');
  var elapsedTime = document.getElementById('elapsed-time');
  var displayTime = getClockDisplayTime();
  var cst = getCstDateParts(displayTime);

  missionTime.textContent =
    cst.month + '/' + cst.day + '/' + cst.year + ' ' + cst.hour + ':' + cst.minute + ':' + cst.second + ' CST';
  elapsedTime.textContent = formatElapsed(displayTime.getTime() - LAUNCH_TIME_UTC.getTime());
}

function getClockDisplayTime() {
  return new Date(Math.min(Date.now(), CLOCK_STOP_TIME_UTC.getTime()));
}

function getCstDateParts(date) {
  var cstTime = new Date(date.getTime() - CST_OFFSET_MS);

  return {
    month: String(cstTime.getUTCMonth() + 1).padStart(2, '0'),
    day: String(cstTime.getUTCDate()).padStart(2, '0'),
    year: cstTime.getUTCFullYear(),
    hour: String(cstTime.getUTCHours()).padStart(2, '0'),
    minute: String(cstTime.getUTCMinutes()).padStart(2, '0'),
    second: String(cstTime.getUTCSeconds()).padStart(2, '0'),
  };
}

function formatElapsed(ms) {
  var totalSeconds = Math.max(0, Math.floor(ms / 1000));
  var days = Math.floor(totalSeconds / 86400);
  var hours = Math.floor((totalSeconds % 86400) / 3600);
  var minutes = Math.floor((totalSeconds % 3600) / 60);
  var seconds = totalSeconds % 60;

  return [
    String(days).padStart(2, '0') + 'd',
    String(hours).padStart(2, '0') + 'h',
    String(minutes).padStart(2, '0') + 'm',
    String(seconds).padStart(2, '0') + 's',
  ].join(' ');
}

/* YouTube Players */
function onYouTubeIframeAPIReady() {
  PLAYER_CONFIGS.forEach(function (config) {
    createPlayer(config);
  });
}

function createPlayer(config) {
  new YT.Player(config.elementId, {
    videoId: config.videoId,
    playerVars: {
      autoplay: 1,
      rel: 0,
      modestbranding: 1,
    },
    events: {
      onReady: function (event) {
        config.onReady(event.target);
        sizePlayerIframe(event.target);
      },
    },
  });
}

function sizePlayerIframe(player) {
  var iframe = player.getIframe();
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
}
