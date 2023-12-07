$(function () {
    $('.deleteBtn').on('click', function (e) {
        if (confirm("All products which belong to this category will also be deleted?\nAre you sure that?")) {
            const $btn = $(this);
            fetch($btn.data('url'), {
                method: 'DELETE',
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    } else {
                        return response.json();
                    }
                    //window.location.href = 'http://localhost:3000/categories';
                }).then(data => {
                    window.location.href = data.redirect;
                })
                .catch(error => {
                    // Handle error
                    console.error('There was a problem with the delete request:', error);
                });
        }
    });
});
