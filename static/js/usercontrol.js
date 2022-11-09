function randpass(el){
    var length = 8,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
    };
    $(el).val(retVal);
};
function changeuname(input, value){
    $(input).val(value);
};
function get_user_list(to_listbox, div, skip){
    if (!skip){
        $('#preloader').addClass('preloader-right');
        $('#preloader').addClass('preloader-active');
        $('.right_pannel').removeClass("right_pannel_move");
        clearTimeout(window.vanish);
    };
    dt = {'status' : 'user', 'action' : 'userfind'};
    $.ajax({
        url:'/',
        method: 'POST',
        dataType: 'html',
        data: dt
        })
        .done (function(data){
            $(to_listbox).empty();
            var json = JSON.parse(data)
            console.log(json)
            if (Object.keys(json).length == 1) {
                $('#change-username').val(json[0]);
            };
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
                    rightshow(div); 
                },300);
            };
        })
        .fail (function(){

        });
};
function userdel(form){
    data = $(form).serialize().split('&')
    data[0] = 'status=user'
    data[1] = 'action=userdel'
    newdata = data.join("&")
    if (confirm('Подтвердите удаление пользователя!')) { 
        form_submit(form, newdata)
    };
}
function userchange(form){
    data = $(form).serialize()
    console.log(data)
    if (!data.match('isnewpasswd') & 
        !data.match('isnewusername') & 
        !data.match('isnewrole') ) {
            responce_handler('nothing_change');
    } else {
        form_submit(form)
    };
}