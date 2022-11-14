function form_submit(form, getdata){
    if (getdata){
        data = getdata
    }else{data = $(form).serialize()};
    $.ajax({
    url:'/',
    method: 'POST',
    dataType: 'html',
    data: data
    })
    .done(function(data) {
        console.log(data)
        responce_handler(data, form);
    })
    .fail(function(){
        alert('Внутрення ошибка, перезагрузите страницу!');
    });
};