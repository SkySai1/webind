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
        showservinfo(data);
    })
    .fail(function(){
        alert('Внутрення ошибка, перезагрузите страницу!');
    });
};

function showservinfo(data){
    var json = JSON.parse(data)
    if (json.serv_config.clear_serv == 'true'){
        console.log(json);
    } else {
        console.log(json);
    }
    const $body = document.querySelector('#servcontrol_front');
    $body.textContent='';

    //Заголовок - хост
    const $host = document.createElement('h2');
    $host.textContent=json.serv_controls.hostname;
    $body.appendChild($host);

    //Блок параметров сервера
    const $content = document.createElement('div');
    $body.appendChild($content);

        //Таблица свойств
        const $table = document.createElement('table');
        $table.classList.add('servtable');
        $content.appendChild($table)

            //Версия DNS
            const $row1 = document.createElement('tr')
            $table.appendChild($row1);
            const $bindvers_txt = document.createElement('th');
            const $bindvers_data = document.createElement('th');
            $bindvers_txt.textContent='Версия DNS сервиса:'
            $bindvers_data.textContent=json.serv_controls.bind_version;
            $row1.appendChild($bindvers_txt);
            $row1.appendChild($bindvers_data);

            //Рабочая директория
            const $row2 = document.createElement('tr')
            $table.appendChild($row2);
            const $workdir_txt = document.createElement('th');
            const $workdir_data = document.createElement('th');
            $workdir_txt.textContent='Ориентация:';
            $workdir_data.textContent=json.serv_controls.core;
            $row2.appendChild($workdir_txt);
            $row2.appendChild($workdir_data);
    
    $('#servcontrol').removeClass('hidden');
};

function servcontrol_close(){
    $('#servcontrol').addClass('hidden');
    const $body = document.querySelector('#servcontrol_front');
    $body.textContent='';
};