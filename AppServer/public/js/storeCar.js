$('#dashboard').on('click', () => {
    window.location.href = '/dashboard';
})
$('#car').on('click', () => {
    window.location.href = '/car';
})
$('#ap').on('click', () => {
    window.location.href = '/ap';
})
$('#brand').on('click', () => {
    window.location.href = '/brand';
})
$('#type').on('click', () => {
    window.location.href = '/type';
})

function assignDelete() {
    $('.delete').on('click', async function (e) {

        const id = $(e.target).data('id');
        console.log($(e.target));
        const url = `/api/car`;
        const data = { id };
        $('#sureDelete').on('click', async () => {
            try {
                const response = await xuanFetchPost(url, data, 'DELETE');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const result = await response.json();
                displayDeleteResult(result);
            } catch (error) {
                console.error('Error:', error);
                throw error;
            }
        })
    })
}
assignDelete();


function displayDeleteResult(result) {
    $('.toast-body').text(result.message);
    if (result.success) {
        $('.toast-header').css('background-color', 'green');
        $('.toast-body').append('<div>&#10;&#13;We will refresh after 5 seconds<div>');
        setTimeout(() => {
            window.location.href = '/car';
        }, 5000);
    } else {
        $('.toast-header').css('background-color', 'red');
    }

    let toast = document.querySelector('.toast');
    if (toast) {
        let myToast = new bootstrap.Toast(toast);
        myToast.show();
    }
}

$('#SearchBar').on('input', async function () {
    var inputValue = $(this).val();
    try {
        const response = await xuanFetchGet(`/api/car/name?name=${inputValue}`);
        if (response.ok) {
            const cars = await response.json();
            $('#car-container').empty();
            cars.forEach(e => {
                $('#car-container').append(` 

                <div class="job-box d-md-flex align-items-center justify-content-between mb-30">
                        <div class="job-left d-md-flex align-items-center flex-wrap w-100">
                            <div
                                class="col-auto col-md-3 ms-md-0 ms-auto me-md-0 me-auto d-flex justify-content-center my-2">
                                <img src="/images/cars/${e.id}/avatar.png" class="img-thumbnail mx-auto my-auto">
                            </div>
                            <div class="col-md-9 job-content">
                                <h5 style="text-overflow: ellipsis; overflow: hidden;"
                                    class="textHeader ms-4 mb-2 text-left">${e.car_name}</h5>
                                <ul class="d-md-flex flex-wrap text-capitalize ff-open-sans">
                                    <li class="me-md-3 ms-4">
                                        <i class="zmdi zmdi-car-wash me-2"></i>${e.brand}
                                    </li>
                                    <li class="me-md-3 ms-4">
                                        <i class="zmdi zmdi-money me-2"></i>${e.price}
                                    </li>
                                    <li class="me-md-3 ms-4">
                                        <i class="zmdi zmdi-drink me-2"></i>${e.type}
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="row row-cols-2 row-cols-md-1 my-0 gy-0">
                            <div>
                                <div class="job-right my-4 flex-shrink-0 ">
                                    <a href="/car/edit/${e.id}"
                                        class="btn d-block w-100 d-sm-inline-block btn-light edit"><i
                                            class="fa-solid fa-pen-to-square" style="color: #0b488e;"></i></a>
                                </div>
                            </div>
                            <div>
                                <div class="job-right my-4 flex-shrink-0 " data-bs-target="#deleteModal"
                                    data-bs-toggle="modal">
                                    <a href="#!" class="btn d-block w-100 d-sm-inline-block btn-light delete"
                                        data-bs-target="#deleteModal" data-bs-toggle="modal" data-id=${e.id}><i
                                            class="fa-solid fa-trash" style="color: #7e1811;"
                                            data-id=${e.id}}></i></a>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    `)
            });
            assignDelete();
        }
    } catch (error) {

    }

});