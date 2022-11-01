function getservlist(data){
    $.ajax({
    url:'/',
    method: 'POST',
    dataType: 'html',
    data: data
    })
    .done(function(data) {
        if (data=='db_failed') {
            const $servlist = document.querySelector('#servlist');
            const $message = document.createElement('h3');
            $message.textContent ='Список серверов пуст';
            $servlist.appendChild($message);  
        } else {
            var json = JSON.parse(data)
            var $servlist = document.getElementById('servlist');
            $servlist.textContent='';
            for (object in Object.keys(json)) {
                const $button = document.createElement('button');
                const $form = document.createElement('form');
                const $hidden1 = document.createElement('input');
                const $hidden2 = document.createElement('input');
                const $hidden3 = document.createElement('input');
                const $host = document.createElement('h3');
                const $status = document.createElement('a');
                const $rightdiv = document.createElement('div');
                const $img = document.createElement('img');


                const $servlist = document.querySelector('#servlist');
                $servlist.appendChild($form);         

                $hidden1.type='hidden';
                $hidden1.name='status';
                $hidden1.value='server';

                $hidden2.type='hidden';
                $hidden2.name='action';
                $hidden2.value='getserver';

                $hidden3.type='hidden';
                $hidden3.name='servname';
                $hidden3.value=json[object].hostname;
                
                $form.appendChild($hidden1);
                $form.appendChild($hidden2);
                $form.appendChild($hidden3);

                $form.classList.add('row');
                $form.style='align-items: center;';
                
                $img.src='../static/img/settings.svg';
                $img.classList.add('settings-svg');
                $button.appendChild($img);
                $button.type='button';
                $button.style='margin-right: 0.5em; background: none; border: none;';
                $button.onclick=function(){getserv(this.form, this);};
                $form.appendChild($button);

                $form.appendChild($rightdiv);

                $host.textContent = json[object].hostname;
                $host.style='word-break: break-all;';
                $rightdiv.appendChild($host);
                
                if (json[object].configured == 'true') {
                    $status.textContent = 'Настроен'
                } else {
                    $status.textContent = 'Новый сервер'
                };
                $rightdiv.appendChild($status);
            };
        };
    })
    .fail(function(data){
        alert('Внутрення ошибка, перезагрузите страницу!');
    });
};

function getserv(form, dom){
    $(dom).children('.settings-svg').addClass('rotate');
    $.ajax({
    url:'/',
    method: 'POST',
    dataType: 'html',
    data: $(form).serialize()
    })
    .done(function(data) {
        $(dom).children('.settings-svg').removeClass('rotate');
        if (data == 'newserv'){
            console.log('new');
        } else {
            var json = JSON.parse(data)
            console.log(json)
        }
    })
    .fail(function(){
        alert('Внутрення ошибка, перезагрузите страницу!');
    });
};