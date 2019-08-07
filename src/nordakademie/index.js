import request from "request";

exports.getLatestTimes = (zenturie, semester) => {
    const dates = getICalSTARTNextWeek();
    let times = [[], [], [], [], [], [], []];
    request({
        uri: `https://cis.nordakademie.de/fileadmin/Infos/Stundenplaene/${zenturie}_${semester}.ics`,
    }, function (error, response, body) {

        const regex = /BEGIN:VEVENT.*?END:VEVENT/sg;

        let m;
        while ((m = regex.exec(body)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            // The result can be accessed through the `m`-variable.
            m.forEach((match, groupIndex) => {
                const lines = match.split("\n");
                lines.forEach(line => {
                    if (line.startsWith("DTEND")) {
                        dates.map((date, index) => {
                            if (line.includes(date)) {
                                times[index].push(line.substring(line.lastIndexOf("T") + 1).replace("\r", ""));
                            }
                        });
                    }
                })
            });
        }
        times = times.map(weekday => weekday.length && Math.max.apply(Math, weekday));
        console.log(times);
    });
};

const getMondayThisOrNextWeek = () => {
    for (let i = 0; i < 7; i++) {
        let today = new Date();
        today.setDate(today.getDate() + i);
        if (today.getDay() === 1) {
            return today;
        }
    }
};

const getICalSTARTNextWeek = () => {
    let dates = [];
    for (let i = 0; i < 7; i++) {
        var date = getMondayThisOrNextWeek();
        date.setDate(date.getDate() + i);
        dates.push(`${date.getFullYear()}${date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1}${date.getDate() < 10 ? "0" + (date.getDate()) : date.getDate()}`);
    }
    return dates;
};