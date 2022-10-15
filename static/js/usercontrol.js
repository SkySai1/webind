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
function user_list_filter(input, userlist) {
    $(input).on('keyup', function() {
      var filter = $(this).val().toLowerCase();
      $('option').each(function() {
        var text = $(this).text().toLowerCase();
        //if ($(this).text().includes(filter)) {
        if (text.includes(filter)){
            $(this).show();
        } else {
          $(this).hide();
        }
        $(userlist).val(filter);
      })
    })
  };
  function get_user_list(to_listbox){
    $('.preloader-hide').addClass('preloader-active');
    clearTimeout(window.vanish);
    dt = {'status' : 'userfind', 'action' : 'getuserlist'};
    $.ajax({
        url:'/',
        method: 'POST',
        dataType: 'html',
        data: dt
        })
        .done (function(data){
            $(to_listbox).empty();
            var json = JSON.parse(data)
            if (Object.keys(json.usernames).length > 10) {i = 10}
            else { i = Object.keys(json.usernames).length};
            $(to_listbox).attr('size', i);
            for (var key in json.usernames) {
                $(to_listbox).append(function () {
                    return $('<option>', {text: json.usernames[key]});
                });
            };
            $('.preloader-hide').addClass('opacity');
            window.vanish = setTimeout(function(){
                $('.preloader-hide').removeClass('preloader-active');
                $('.preloader-hide').removeClass('opacity');
            },500);
        })
        .fail (function(){

        });
};
function userdel(form){
    newval = $('#change-username').val();
    if (!newval) {responce_handler('empty_user')}
    else{
        $('#username-fordel').val(newval);
        if (confirm('Потвердите удаление пользователя - '+newval)) { 
            form_submit(form);
        };
    };
}