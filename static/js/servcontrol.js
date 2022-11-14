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
            //rightshow(div); 
        },500);
    })
    .fail(function(){
        alert('Внутрення ошибка, перезагрузите страницу!');
    });
};
function changeservname(input, value){
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
        })
        .fail (function(){

        });
};

function servchange(form){
    data = $(form).serialize().split('&')
    bool = true
    for (key in data){
        row = data[key].split('=')
        if (!row[1]) {
            bool = false;
            break;
        }
    };
    if (bool != false) {
        form_serv_submit(form)
    } else {
        responce_handler('empty_serv_field')
    }
    
}
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

function servupdate_conf(form){
    form_submit(form);

}

function sendUpdate(form){
    data = $(form).serialize().split('&');
    for (i in data) {
        if (data[i].includes('hostname')) {
            hostname=data[i].split('=')[1]
        };
    };
    data.push("status=server");
    data.push("action=updateconf");
    data = data.join('&')
    localStorage.setItem('hostname', hostname);
    //console.log(data)
    form_submit('',data);
};
function updatesuccess(){
    getservlist();
    hostname = localStorage['hostname'];
    var data = {
        status: "server",
        action: "getserver",
        servname: hostname
    };
    id = localStorage.getItem('servPos');
    getserv('',id,data);
}