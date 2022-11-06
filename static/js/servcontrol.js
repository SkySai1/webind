function form_serv_submit(form){
    $('.preloader-hide').addClass('preloader-active');
    clearTimeout(window.vanish);
    $.ajax({
    url:'/',
    method: 'POST',
    dataType: 'html',
    data: $(form).serialize()
    })
    .done(function(data) {
        responce_handler(data);
        $('.preloader-hide').addClass('opacity');
        var data = {
            status: "server",
            action: "getservlist"
        };
        getservlist(data)
        window.vanish = setTimeout(function(){
            $('.preloader-hide').removeClass('preloader-active');
            $('.preloader-hide').removeClass('opacity');
        },500);
    })
    .fail(function(){
        alert('Внутрення ошибка, перезагрузите страницу!');
    });
};
function changeserv(input, value){
    $(input).val(value);
};

function get_servlistbox(to_listbox){
    $('.preloader-hide').addClass('preloader-active');
    clearTimeout(window.vanish);
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
            if (Object.keys(json).length > 10) {i = 10}
            else { i = Object.keys(json).length};
            $(to_listbox).attr('size', i);
            for (var key in json) {
                $(to_listbox).append(function () {
                    return $('<option>', {text: json[key]});
                });
            };
            $('.preloader-hide').addClass('opacity');
            window.vanish = setTimeout(function(){
                $('.preloader-hide').removeClass('preloader-active');
                $('.preloader-hide').removeClass('opacity');
            },500);
            console.log(json)
        })
        .fail (function(){

        });
};