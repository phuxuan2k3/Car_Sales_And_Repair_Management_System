function dateToString(date) {
    let d = new Date(date);
    let day = ("0" + d.getDate()).slice(-2);
    let month = ("0" + (d.getMonth() + 1)).slice(-2);
    let today = d.getFullYear() + "-" + (month) + "-" + (day);
    return today;
}

function formSerializeCombine(formJquery) {
    const res = {};
    const serArray = formJquery.serializeArray();
    for (const obj of serArray) {
        res[obj.name] = obj.value;
    }
    return res;
}