const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
);

const L = (str) =>
  ({
    Saturday: "Shabbos - " + getCurrentParsha(),
  }[str] || str);

const getCurrentParsha = () =>
  toTitleCase(
    KosherZmanim.Parsha[
      new KosherZmanim.JewishCalendar(
        moment().startOf("week").add(6, "days").toDate()
      ).getParsha()
    ]
  );

const toTitleCase = (str) =>
  str
    .split(" ")
    .map((word) =>
      word
        .split("")
        .map((c, i) => (i === 0 ? c.toUpperCase() : c.toLowerCase()))
        .join("")
    )
    .join("");

const today = new Date().toISOString();
const options = {
  date: today,
  timeZoneId: "America/New_York",
  locationName: "Monsey",
  latitude: 41.137804,
  longitude: -74.044059,
  elevation: 169, //  meters
  complexZmanim: true,
};
json = KosherZmanim.getZmanimJson(options);
console.log(JSON.stringify(json, null, 2));
const roundDown = (m) => m.startOf("minute");
const roundUp = (m) => m.add(1, "minute").startOf("minute");
const getZmanim = (m) => {
  const today = new Date().toISOString();
  const options = {
    date: m.toDate(),
    timeZoneId: "America/New_York",
    locationName: "Monsey",
    latitude: 41.137804,
    longitude: -74.044059,
    elevation: 169,
    complexZmanim: true,
  };
  const { Zmanim } = KosherZmanim.getZmanimJson(options);
  return Zmanim;
};
const friday = moment().startOf("week").add(6, "days");
const shabbos = moment().startOf("week").add(7, "days");

const EVENTS = {
  sundayShacharis: {
    label: "Shacharis",
    value: "8:15 AM",
  },
  yorucha: {
    label: "Yorucha",
    value: "9:30 AM",
  },
  minchaMariv: {
    label: "Mincha/Mariv",
    value: moment(json.Zmanim.Sunset).subtract(12, "minutes"),
  },
  oraissa: {
    label: "Oraissa",
    value: "6:00 AM",
  },
  shacharis: {
    label: "Shacharis",
    value: "7:00 AM",
  },
  dafMorning: {
    label: "Daf Yomi",
    value: "Following Shacharis",
  },
  dafEvening: {
    label: "Daf Yomi",
    value: "9:00 PM",
  },
  mariv: {
    label: "Mariv",
    value: "8:15 PM",
  },
  parshaShiur: {
    label: "Parsha Shiur",
    value: "8:30 - 9:00 PM",
  },
  shabbosShacharis: {
    label: "Shacharis",
    value: "8:45 AM",
  },
  shabbosEarlyMincha: {
    label: "Early Mincha",
    value: "1:45 PM",
  },
  tehillim: {
    label: "Tehillim",
    value: "2:30 PM",
  },
  shabbosOraissa: {
    label: "Oraissa",
    value: moment(getZmanim(shabbos).SeaLevelSunset)
      .subtract(35, "minutes")
      .subtract(1, "hours"),
  },
  shabbosMincha: {
    label: "Mincha",
    value: moment(getZmanim(shabbos).SeaLevelSunset).subtract(35, "minutes"),
  },
  likrasShabbos: {
    label: "Likras Shabbos",
    value: moment(getZmanim(friday).CandleLighting)
      .add(8, "minutes")
      .subtract(20, "minutes"),
  },
  shabbosMariv: {
    label: "Mariv Motzei Shabbos",
    value: moment(getZmanim(shabbos).SeaLevelSunset).add(50, "minutes"),
  },
  shabbosHavdala: {
    label: "Havdalah",
    value: moment(getZmanim(shabbos).Tzais),
  },
  shabbosDayDaf: {
    label: "Daf Yomi",
    value: moment(getZmanim(shabbos).SeaLevelSunset)
      .subtract(35, "minutes")
      .subtract(1, "hours"),
  },
  dafYomiFridayNight: {
    label: "Daf Yomi",
    value: "8:00 PM",
  },
  shabbosAvosUbanim: (m) => ({
    label: "Avos Ubanim",
    value:
      m.isSame(moment("2021-01-16"), "day") ||
      m.isSame(moment("2021-01-23"), "day")
        ? m.hour(6).minutes(40)
        : m.isSame(moment("2021-02-6"), "day") ||
          m.isSame(moment("2021-01-30"), "day")
        ? m.hour(6).minutes(45)
        : m.isSame(moment("2021-02-13"), "day") ||
          m.isSame(moment("2021-02-20"), "day")
        ? m.hour(7).minutes(0)
        : "TBD",
  }),
  minchaErevShabbos: {
    label: "Mincha Erev Shabbos",
    value: moment(getZmanim(friday).CandleLighting).add(8, "minutes"),
  },
  candleLighting: {
    label: "Candle Lighting",
    value: roundDown(moment(getZmanim(friday).CandleLighting)),
  },
};
const getSchedule = (m) => {
  let schedule = [];

  switch (m.weekday()) {
    case 0: // sunday
      schedule = [EVENTS.sundayShacharis, EVENTS.yorucha, EVENTS.minchaMariv];
      break;
    case 1: // mon
    case 2: // tue
    case 3: // wed
      schedule = [
        EVENTS.oraissa,
        EVENTS.shacharis,
        EVENTS.dafMorning,
        EVENTS.mariv,
        EVENTS.dafEvening,
      ];
      break;
    case 4: // thu
      schedule = [
        EVENTS.oraissa,
        EVENTS.shacharis,
        EVENTS.dafMorning,
        EVENTS.mariv,
        EVENTS.parshaShiur,
        EVENTS.dafEvening,
      ];
      break;
    case 5: // friday
      schedule = [
        EVENTS.shacharis,
        EVENTS.dafMorning,
        EVENTS.candleLighting,
        EVENTS.minchaErevShabbos,
        EVENTS.dafYomiFridayNight,
      ];
      break;
    case 6: // shabbos
      schedule = [
        EVENTS.shabbosShacharis,
        EVENTS.shabbosEarlyMincha,
        EVENTS.tehillim,
        EVENTS.shabbosOraissa,
        EVENTS.shabbosDayDaf,
        EVENTS.shabbosMincha,
        EVENTS.shabbosMariv,
        // EVENTS.shabbosHavdala,
        EVENTS.shabbosAvosUbanim(m),
      ];
      break;

    default:
  }
  return schedule;
};
const getNDaySchedule = (n) =>
  [...new Array(n)].reduce((prev, cur, i) => {
    const today = moment();
    const dayN = moment().add(i, "day");
    const key = today.isSame(dayN, "day")
      ? `Today (${L(dayN.format("dddd"))})`
      : L(dayN.format("dddd"));
    prev[key] = getSchedule(dayN);
    return prev;
  }, {});

const schedules = {
  ...getNDaySchedule(2),
  zmanim: [
    {
      label: "Neitz",
      value: roundUp(moment(json.Zmanim.SeaLevelSunrise)),
    },
    {
      label: 'Krias Shema (MG"A)',
      value: moment(json.Zmanim.SofZmanShmaMGA),
    },
    {
      label: 'Krias Shema (GR"A)',
      value: moment(json.Zmanim.SofZmanShmaGRA),
    },
    // {
    //   label: 'Zman Tefilla (MG"A)',
    //   value: moment(json.Zmanim.SofZmanTfilaMGA),
    // },
    {
      label: 'Zman Tefilla (GR"A)',
      value: moment(json.Zmanim.SofZmanTfilaGRA),
    },
    {
      label: "Chatzos",
      value: moment(json.Zmanim.Chatzos),
    },
    {
      label: "Shkia",
      value: moment(json.Zmanim.SeaLevelSunset),
    },
    {
      label: "Tzais",
      value: roundUp(moment(json.Zmanim.Tzais)),
    },
    {
      label: "Tzais (72)",
      value: roundUp(moment(json.Zmanim.Tzais72)),
    },
  ],
};

const renderSchedule = (schedule) =>
  schedule &&
  schedule
    .map(
      ({ label, value }) => `
              <div class="row">
                <div class="label">${label}</div>
                <div class="dots"></div>
        <div class="value">${
          typeof value === "string"
            ? value
            : typeof value === "function"
            ? typeof value() === "string"
              ? value()
              : value().format("LT")
            : value.format("LT")
        }</div>
              </div>
    `
    )
    .join("");

Object.keys(schedules).map((schedule) => {
  console.log(`Rendering ${schedule}`);
  let elem;
  try {
    elem = document.querySelector("." + schedule);
  } catch {}

  if (!elem) {
    elem = document.querySelector(".schedule");
    elem.innerHTML += `<h2>${schedule}</h2>`;
    elem.innerHTML += renderSchedule(schedules[schedule]);
  } else {
    elem.innerHTML = renderSchedule(schedules[schedule]);
  }
});

[...document.querySelectorAll(".parsha")].map(
  (elem) => (elem.innerHTML = getCurrentParsha())
);

const timeElements = [...document.querySelectorAll(".time")];
setInterval(() =>
  timeElements.map((elem) => (elem.innerHTML = moment().format("LTS")), 1000)
);
const hebrewDateElements = [...document.querySelectorAll(".hebrew-date")];
hebrewDateElements.map(
  (elem) =>
    (elem.innerHTML = new KosherZmanim.JewishCalendar(moment().toDate()))
);
const englishDateElements = [...document.querySelectorAll(".english-date")];
englishDateElements.map((elem) => (elem.innerHTML = moment().format("LL")));

if (!isMobile) setTimeout(() => window.location.reload(), 1000 * 60 * 60);

const mapElements = (cssSelector, callback) =>
  [...document.querySelectorAll(cssSelector)].map(
    (elem) => (elem.innerHTML = callback())
  );

const pageLoad = moment();
setInterval(
  () =>
    mapElements(
      ".refresh-time",
      () => "<small><i>Refreshed " + pageLoad.fromNow()
    ) + "...</i></small>",
  1000
);
