let page = 1;
let per_page = 5;
let totalPage = 0
let showDetail = [];

const updatePageInfo = async () => {
    $('#PageInfo').text(`${page}/${totalPage}`)
}

const prePage = async (event) => {
    event.preventDefault();
    if (page <= 1) return;
    page -= 1;
    await updateShowDetail(page);
    await generateTable();
    updatePageInfo();
}

const nextPage = async (event) => {
    event.preventDefault();
    if (page >= totalPage) return;
    page += 1;
    await updateShowDetail(page);
    await generateTable();
    updatePageInfo();
}

const updateShowDetail = async (curPage) => {
    showDetail = data.slice((curPage - 1) * per_page,(curPage - 1) * per_page + per_page );
}

const generateTable = async () => {
    let tbBody = $('#tbBody');
    tbBody.empty();
    for (const detail of showDetail) {
        tbBody.append(detail);
    }
}

const backToPrePage = async () => {
    window.history.back();
}

const init = async () => {
    if(data.length > per_page) {
        $('.pagination').removeClass('d-none');
        totalPage = Math.ceil(data.length / per_page);
    } else {
        $('.pagination').addClass('d-none');
    }
    await updateShowDetail(page);
    await generateTable();
    await updatePageInfo();
}

init();