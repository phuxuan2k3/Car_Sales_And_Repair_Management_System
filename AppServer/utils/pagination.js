module.exports = async (noPerPage, noAll, page) => {
    const noPage = Math.ceil(noAll / noPerPage);
    page = page || 1;
    if (page > noPage) {
        page = 1;
    }
    let pagination = Array.from({ length: noPage }, (_, index) => index + 1);
    let pageState = 'ok';
    if (noPage == 1) {
        pageState = 'only';
    }
    else if (page == noPage) {
        pageState = 'max';
    } else if (page == 1) {
        pageState = 'min';
    }
    return { pageState, pagination, page, noPage };
}