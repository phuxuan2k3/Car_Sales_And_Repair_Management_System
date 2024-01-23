let optionButtons = $('input[name="recordOptionButton"]');
let SearchBar = $('#SearchBar');
//function

const search = (item, searchString) => {
    if (searchString == '' || searchString == null || searchString == undefined) return true;
    let str = `${item.fixrecord_id}${item.car_plate}`
    str = str.toLowerCase();
    return str.includes(searchString.toLowerCase());
}

const drawTable = async (data) => {
    let tbBody = $(`#tbBody`);
    tbBody.empty();
    for (const record of data) {
        tbBody.append(`
                    <tr onclick="updateDetailTable(${record.fixrecord_id},'${record.status}')" class="text-center recordInfo" recordId="${record.fixrecord_id}">
                        <td scope="col">${record.fixrecord_id}</td>
                        <td scope="col">${record.car_plate}</td>
                        <td scope="col">${record.date}</td>
                        <td scope="col">${record.total_price}$</td>
                        <td scope="col" class="${record.status == "Done" ? "text-success" : "text-warning"} fw-bold">${record.status}</td>
                    </tr>
        `)
    }

}

const init = async () => {
    let option = $('input[name="recordOptionButton"]:checked').val();
    let SearchBar = $('#SearchBar').val();
    await updateRecordTable(option, SearchBar);
}

const updateRecordTable = async (option, searchString) => {
    const rs = await fetch('/api/cfix/all');
    let data = (await rs.json()).fixRecords;
    data = option != 'all' ? data.filter(item => item.status === option && search(item, searchString) === true) : data.filter(item => search(item, searchString) === true);
    await drawTable(data);
}

const updateDetailTable = async (recordId, status) => {
    let fixDetail = $('#fixDetail');
    let optionButtonGroup =  $('#optionButtonGroup');
    let currentId = $('#currentId');
    currentId.text(recordId);
    let rs = await fetch(`api/cfix/info?fixrecord_id=${recordId}`);
    const data = await rs.json();
    const details = data.fixDetails;
    let detailTbBody = $('#detailTbBody');
    detailTbBody.empty();
    for (const detail of details) {
        rs = await fetch(`api/user/${detail.mec_id}`);
        const mec = await rs.json();
        rs = await fetch(`api/ap/detail?id=${detail.ap_id}`);
        const autoPart = (await rs.json())[0];
        detailTbBody.append(`
            <tr class="text-center">
                <td scope="col">${detail.date}</td>
                <td scope="col">${detail.detail}</td>
                <td scope="col">${mec.lastname}</td>
                <td scope="col">${autoPart.name}</td>
                <td scope="col">${detail.quantity}</td>
                <td scope="col">${autoPart.price}$</td>
                <td scope="col">${detail.price}$</td>
            </tr>
        `)
    }
    console.log(recordId)
    if (status != 'Done' ||recordId == null || recordId == undefined ) {
        optionButtonGroup.removeClass('d-none')
    } else {
        optionButtonGroup.addClass('d-none')
    };
}


//event
optionButtons.on('input', async function (e) {
    let option = $('input[name="recordOptionButton"]:checked').val();
    let SearchBar = $('#SearchBar').val();
    await updateRecordTable(option, SearchBar);
})

SearchBar.on('input', async function (e) {
    let option = $('input[name="recordOptionButton"]:checked').val();
    let SearchBar = $('#SearchBar').val();
    await updateRecordTable(option, SearchBar);
})

//run
init();


