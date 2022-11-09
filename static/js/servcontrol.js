function form_serv_submit(form, getdata){
    if (getdata){
        data = getdata
    }else{data = $(form).serialize()};
    //$('#preloader').addClass('preloader-right');
    $('#preloader').addClass('preloader-active');
    clearTimeout(window.vanish);
    $.ajax({
    url:'/',
    method: 'POST',
    dataType: 'html',
    data: data
    })
    .done(function(data) {
        responce_handler(data, form);
        var data = {
            status: "server",
            action: "getservlist"
        };
        getservlist(data)
        $('#preloader').addClass('opacity');
        window.vanish = setTimeout(function(){
            $('#preloader').removeClass('preloader-right');
            $('#preloader').removeClass('preloader-active');
            $('#preloader').removeClass('opacity');
            rightshow(div); 
        },500);
    })
    .fail(function(){
        alert('Внутрення ошибка, перезагрузите страницу!');
    });
};
function changeserv(input, value){
    $(input).val(value);
};

function get_servlistbox(to_listbox, div, skip){
    if (!skip){
        $('#preloader').addClass('preloader-right');
        $('#preloader').addClass('preloader-active');
        $('.right_pannel').removeClass("right_pannel_move");
        clearTimeout(window.vanish);
    };
    dt = {'status' : 'server', 'action' : 'getservlistbox'};
    $.ajax({
        url:'/',
        method: 'POST',
        dataType: 'html',
        data: dt
        })
        .done (function(data){
            $(to_listbox).empty();
            var json = JSON.parse(data)
            if (Object.keys(json).length == 1) {
                $('#change-servhost').val(json[0]);
            }
            if (Object.keys(json).length > 10) {i = 10}
            else { i = Object.keys(json).length};
            $(to_listbox).attr('size', i);
            for (var key in json) {
                $(to_listbox).append(function () {
                    return $('<option>', {text: json[key]});
                });
            };
            if (!skip){
                $('#preloader').addClass('opacity');
                window.vanish = setTimeout(function(){
                    $('#preloader').removeClass('preloader-active');
                    $('#preloader').removeClass('preloader-right');
                    $('#preloader').removeClass('opacity');
                    rightshow(div, true); 
                },300);
            };
            console.log(json)
        })
        .fail (function(){

        });
};
function servdel(form){
    data = $(form).serialize().split('&');
    data[0] = 'status=server';
    data[1] = 'action=servdel';
    newdata = data.join("&");
    let hostname = document.querySelector('#change-servhost').value
    if (!hostname) {
        rmi('red', 'Выберете сервер!');
    } else {
        if (confirm('Подтвердите удаление сервера!')) { 
        form_serv_submit(form, newdata, form)
        };
    };
};