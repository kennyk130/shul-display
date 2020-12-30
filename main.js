const today = new Date().toISOString();
const options = {
  date: today,
  timeZoneId: "America/New_York",
  locationName: "Monsey",
  latitude: 41.137804,
  longitude: -74.044059,
  elevation: 554.5, // feet, or 169 meters
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
    elevation: 554.5, // feet, or 169 meters
    complexZmanim: true,
  };
  const { Zmanim } = KosherZmanim.getZmanimJson(options);
  return Zmanim;
};
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
    value: "??",
  },
  tehillim: {
    label: "Tehillim",
    value: "??",
  },
  shabbosMincha: {
    label: "Mincha",
    value: "??",
  },
  shabbosMariv: {
    label: "Mariv Motzei Shabbos",
    value: "??",
  },
  shabbosHavdala: {
    label: "Havdalah",
    value: "??",
  },
  shabbosAvosUbanim: {
    label: "Avos Ubanim",
    value: "??",
  },
};
const getSchedule = () => {
  let schedule = [];
  const today = moment();

  switch (today.weekday()) {
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
      ];
      break;
    case 4: // thu
      schedule = [
        EVENTS.oraissa,
        EVENTS.shacharis,
        EVENTS.dafMorning,
        EVENTS.mariv,
        EVENTS.parshaShiur,
      ];
      break;
    case 5: // friday
      schedule = [EVENTS.shacharis, EVENTS.dafMorning, EVENTS.mariv];
      break;
    case 6: // shabbos
      schedule = [EVENTS.shacharis, EVENTS.dafMorning, EVENTS.mariv];
      break;

    default:
  }
  return schedule;
};
const get3DaySchedule = () => {
  const today = moment();
  const tomorrow = moment().add(1, "day");
  const third = moment().add(2, "day");
  const key_today = `Today (${today.format("dddd")})`;
  const key_tomorrow = `${tomorrow.format("dddd")}`;
  const key_third = `${third.format("dddd")}`;
  const ret = {};
  ret[key_today] = getSchedule(today);
  ret[key_tomorrow] = getSchedule(tomorrow);
  ret[key_third] = getSchedule(third);
  return ret;
};
const friday = moment().startOf("week").add(6, "days");
const shabbos = moment().startOf("week").add(7, "days");

const schedules = {
  ...get3DaySchedule(),
  zmanim: [
    {
      label: "Neitz",
      value: roundUp(moment(json.Zmanim.SeaLevelSunrise)),
    },
    {
      label: 'Krias Shema (MG"A)',
      value: roundDown(moment(json.Zmanim.SofZmanShmaMGA)),
    },
    {
      label: 'Krias Shema (GR"A)',
      value: roundDown(moment(json.Zmanim.SofZmanShmaGRA)),
    },
    {
      label: 'Zman Tefilla (MG"A)',
      value: roundDown(moment(json.Zmanim.SofZmanTfilaMGA)),
    },
    {
      label: 'Zman Tefilla (GR"A)',
      value: roundDown(moment(json.Zmanim.SofZmanTfilaGRA)),
    },
    {
      label: "Chatzos",
      value: moment(json.Zmanim.Chatzos),
    },
    {
      label: "Shkia",
      value: roundDown(moment(json.Zmanim.SeaLevelSunset)),
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
          typeof value === "string" ? value : value.format("LT")
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

setTimeout(() => window.location.reload(), 5 * 1000 * 60);
