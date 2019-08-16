const trainScheduleStore = localforage.createInstance({
    name: "trainSchedulerApp",
    version: 1.0,
    storeName: "trainSchedulerStore"
});

const scheduleKey = "trains";
const currentTime = moment();

trainScheduleStore.getItem(scheduleKey).then(function (value) {
    let trains;

    if (value === null) {
        trains = [];
    } else {
        trains = JSON.parse(value);
    }

    buildSchedule(trains);
});

function clearForm () {
    const trainName = document.getElementById("trainName").value = "";
    const destination = document.getElementById("destination").value = "";
    const firstTrainTime = document.getElementById("firstTrainTime").value = "";
    const frequency = document.getElementById("frequency").value = "";
}

function buildSchedule (trains) {
    const trainScheduleEl = document.getElementById("trainSchedule");
    trainScheduleEl.innerHTML = "";

    for (let trainIndex in trains) {
        const train = trains[trainIndex];
        const scheduleRowEl = document.createElement("tr");
        const diffTime = moment().diff(moment(train.firstTrainTime), "minutes");
        const minutesTillTrain = train.frequency - (diffTime % train.frequency);

        const trainNameCellEl = document.createElement("td");
        trainNameCellEl.textContent = train.trainName;
        scheduleRowEl.appendChild(trainNameCellEl);

        const destinationCellEl = document.createElement("td");
        destinationCellEl.textContent = train.destination;
        scheduleRowEl.appendChild(destinationCellEl);

        const frequencyCellEl = document.createElement("td");
        frequencyCellEl.textContent = train.frequency;
        scheduleRowEl.appendChild(frequencyCellEl);

        const nextArrivalCellEl = document.createElement("td");
        nextArrivalCellEl.textContent = moment(moment().add(minutesTillTrain, "minutes")).format("hh:mm");
        scheduleRowEl.appendChild(nextArrivalCellEl);

        const minutesAwayCellEl = document.createElement("td");
        minutesAwayCellEl.textContent = minutesTillTrain;
        scheduleRowEl.appendChild(minutesAwayCellEl);

        trainScheduleEl.appendChild(scheduleRowEl);
    }
}

document.getElementById("addTrainForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const trainName = document.getElementById("trainName").value;
    const destination = document.getElementById("destination").value;
    const firstTrainTime = document.getElementById("firstTrainTime").value;
    const frequency = parseInt(document.getElementById("frequency").value);

    if (trainName.length === 0 || destination.length === 0 || firstTrainTime.length === 0 || (frequency === 0 || frequency === NaN)) {
        return false;
    }

    const trainObject = {
        trainName: trainName,
        destination: destination,
        firstTrainTime: moment(firstTrainTime, "HH:mm").subtract(1, "years"),
        frequency: frequency
    };

    trainScheduleStore.getItem(scheduleKey).then(function (value) {
        let trains;

        if (value === null) {
            trains = [];
        } else {
            trains = JSON.parse(value);
        }

        trains.push(trainObject);

        trainScheduleStore.setItem(scheduleKey, JSON.stringify(trains)).then(function () {
            buildSchedule(trains);
            clearForm();
        }).catch(function (error) {
            console.warn(error);
        });
    });
});