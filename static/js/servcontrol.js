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

function getservlist(data){
    $.ajax({
    url:'/',
    method: 'POST',
    dataType: 'html',
    data: data
    })
    .done(function(data) {
        var json = JSON.parse(data)
        var $servlist = document.getElementById('servlist');
        $servlist.textContent='';
        for (object in Object.keys(json)) {
            const $newblock = document.createElement('div');
            const $host = document.createElement('h3');
            const $status = document.createElement('a');

            const $servlist = document.querySelector('#servlist');
            $servlist.appendChild($newblock);

            $host.textContent = json[object].hostname;
            $newblock.appendChild($host);
            
            if (json[object].configured == 'true') {
                $status.textContent = 'Настроен'
            } else {
                $status.textContent = 'Не настроен'
            };
            $newblock.appendChild($status);
        };
    })
    .fail(function(){
        alert('Внутрення ошибка, перезагрузите страницу!');
    });
};