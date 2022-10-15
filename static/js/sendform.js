function form_submit(form){
    $.ajax({
    url:'/',
    method: 'POST',
    dataType: 'html',
    data: $(form).serialize()
    })
    .done(function(data) {
        responce_handler(data);
    })
    .fail(function(){
        alert('Внутрення ошибка, перезагрузите страницу!');
    });
};