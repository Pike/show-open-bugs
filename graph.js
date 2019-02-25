var data = null, date_data = [];
async function load_data(params) {
    params.set('include_fields','id,creation_time,priority,cf_last_resolved');
    let response = await fetch(`https://bugzilla.mozilla.org/rest/bug?${params}`);
    let bugs = await response.json();
    data = bugs.bugs;
}

function transform() {
    let events = [];
    for (let bug of data) {
        events.push(
            {
                "op": 1,
                "priority": bug.priority,
                "when": new Date(bug.creation_time)
            }
        )
        if (bug.cf_last_resolved) {
            events.push(
                {
                    "op": -1,
                    "priority": bug.priority,
                    "when": new Date(bug.cf_last_resolved)
                }
            )
        }
    }
    events.sort(function(d1, d2) {
        if (d1.when < d2.when) {
            return -1;
        }
        if (d1.when > d2.when) {
            return 1;
        }
        return 0;
    })
    let datum = {
            open_P1: 0,
            open_P2: 0,
            open_P3: 0,
            open_P4: 0,
            open_P5: 0, 
            closed_P1: 0,
            closed_P2: 0,
            closed_P3: 0,
            closed_P4: 0,
            closed_P5: 0, 

    }
    for (let event of events) {
        datum = Object.assign({}, datum);
        datum.when = event.when;
        datum[`open_${event.priority}`] += event.op;
        if (event.op < 0) {
            datum[`closed_${event.priority}`] += 1;
        }
        date_data.push(datum)
    }
    console.log(date_data);
}

function render() {
    let ctx = document.getElementById("graph").getContext('2d');
    let maxdate = Math.max(date_data[date_data.length-1].when, new Date(2019, 3));
    let chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: "Open P1",
                    steppedLine: 'after',
                    stack: 'open',
                    data: date_data.map(d => ({x: d.when, y: d.open_P1})),
                },
                {
                    label: "Open P2",
                    steppedLine: 'after',
                    stack: 'open',
                    data: date_data.map(d => ({x: d.when, y: d.open_P2})),
                },
                {
                    label: "Open P3",
                    steppedLine: 'after',
                    stack: 'open',
                    data: date_data.map(d => ({x: d.when, y: d.open_P2})),
                },
                {
                    label: "Open P4",
                    steppedLine: 'after',
                    stack: 'open',
                    data: date_data.map(d => ({x: d.when, y: d.open_P2})),
                },
                {
                    label: "Open P5",
                    steppedLine: 'after',
                    stack: 'open',
                    data: date_data.map(d => ({x: d.when, y: d.open_P2})),
                },
                {
                    label: "Closed P1",
                    steppedLine: 'after',
                    stack: 'closed',
                    data: date_data.map(d => ({x: d.when, y: -d.closed_P1})),
                },
                {
                    label: "Closed P2",
                    steppedLine: 'after',
                    stack: 'closed',
                    data: date_data.map(d => ({x: d.when, y: -d.closed_P2})),
                },
                {
                    label: "Closed P3",
                    steppedLine: 'after',
                    stack: 'closed',
                    data: date_data.map(d => ({x: d.when, y: -d.closed_P3})),
                },
                {
                    label: "Closed P4",
                    steppedLine: 'after',
                    stack: 'closed',
                    data: date_data.map(d => ({x: d.when, y: -d.closed_P4})),
                },
                {
                    label: "Closed P5",
                    steppedLine: 'after',
                    stack: 'closed',
                    data: date_data.map(d => ({x: d.when, y: -d.closed_P5})),
                },
            ]
        },
        options: {
            steppedLine: 'after',
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        max: maxdate,
                    }
                }],
                yAxes: [
                    {
                        stacked: true
                    },
                ],
            }
        },
    });
}

document.querySelector('form').addEventListener(
    "submit",
    function(e) {
        e.preventDefault();
        document.location.search = '?' + this.elements.query.value;
        return false;
    },
    false
)

async function boot() {
    if (!document.location.search) {
        return;
    }
    const params = new URLSearchParams(document.location.search);
    document.getElementById('query').value = decodeURIComponent(params.toString());
    await load_data(params);
    transform();
    render();
}
boot();
