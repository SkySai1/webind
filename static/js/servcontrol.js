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
        window.vanish = setTimeout(function(){
            $('.preloader-hide').removeClass('preloader-active');
            $('.preloader-hide').removeClass('opacity');
        },500);
    })
    .fail(function(){
        alert('Внутрення ошибка, перезагрузите страницу!');
    });
};