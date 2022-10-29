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
            const $button = document.createElement('button');
            const $form = document.createElement('form');
            const $hidden1 = document.createElement('input');
            const $hidden2 = document.createElement('input');
            const $hidden3 = document.createElement('input');
            const $host = document.createElement('h3');
            const $status = document.createElement('a');

            const $servlist = document.querySelector('#servlist');
            $servlist.appendChild($form);

            $button.type='button';
            $button.onclick=function(){getserv(this.form);};

            $form.appendChild($button);

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

            $host.textContent = json[object].hostname;
            $button.appendChild($host);
            
            if (json[object].configured == 'true') {
                $status.textContent = 'Настроен'
            } else {
                $status.textContent = 'Не настроен'
            };
            $button.appendChild($status);
        };
    })
    .fail(function(){
        alert('Внутрення ошибка, перезагрузите страницу!');
    });
};

function getserv(form){
    $.ajax({
    url:'/',
    method: 'POST',
    dataType: 'html',
    data: $(form).serialize()
    })
    .done(function(data) {
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