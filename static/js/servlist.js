function getservlist(){
    var data = {
        status: "server",
        action: "getservlist"
    };
    $.ajax({
    url:'/',
    method: 'POST',
    dataType: 'html',
    data: data
    })
    .done(function(data) {
        var json = JSON.parse(data)
        if (Object.keys(json).length < 1) {
            const $servlist = document.querySelector('#servlist');
            const $message = document.createElement('h3');
            $message.textContent ='Список серверов пуст';
            $servlist.appendChild($message);  
        } else {
            makeservlist(json)
        };
    })
    .fail(function(){
        alert('Внутрення ошибка, перезагрузите страницу!');
    });
};

function makeservlist(json) {
    var $servlist = document.getElementById('servlist');
    $servlist.textContent='';
    var i = 0
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
        
        let id='servPos-'+i;
        $img.src='../static/img/settings.svg';
        $img.classList.add('settings-svg');
        $img.id=id;
        $button.appendChild($img);
        $button.type='button';
        $button.style='margin-right: 0.5em; background: none; border: none;';
        $button.onclick=function(){getserv(this.form, id);};
        $form.appendChild($button);

        $form.appendChild($rightdiv);

        $host.textContent = json[object].hostname;
        $host.style='word-break: break-all;';
        $rightdiv.appendChild($host);
        
        if (json[object]['status'] == true) {
            $status.textContent = 'Настроен'
        } else if (json[object]['status'] == false) {
            $status.textContent = 'Новый сервер'
        } else {
            $status.textContent = 'Ошибка статуса'
        };
        $rightdiv.appendChild($status);
        ++i;
    };
};

function getserv(form, id, getdata){
    document.getElementById(id).classList.add('rotate');
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
        document.getElementById(id).classList.remove('rotate')
        localStorage.setItem('servPos', id);
        showservinfo(data);
    })
    .fail(function(){
        alert('Внутрення ошибка, перезагрузите страницу!');
    });
};

function showservinfo(data){
    var json = JSON.parse(data)
    console.log(json)

    $('#servcontrol_hostname').val(json['controls']['hostname']);
    const $body = document.querySelector('#servcontrols');
    $body.textContent='';

    const $config = document.querySelector('#servconfig');
    $config.textContent='';

    //Заголовок - хост
    const $host = document.createElement('h2');
    $host.textContent=json.controls.hostname;
    $body.appendChild($host);

    //Блок параметров сервера
    const $controlsblock = document.createElement('div');
    $body.appendChild($controlsblock);

        //Таблица свойств
        const $table_controls = document.createElement('table');
        $table_controls.classList.add('servtable');
        $controlsblock.appendChild($table_controls)
        for (key in json['controls']) {
            if (json['controls'][key] == false) {break;};
            index = controls_RU(key)
            let row = document.createElement('tr')
            $table_controls.appendChild(row);
            let txt = document.createElement('th');
            let data = document.createElement('th');
            txt.textContent=index+':';
            data.textContent=json['controls'][key];
            row.appendChild(txt);
            row.appendChild(data);
        };

        //Таблица параметров
        /*
        if (json['controls']['status'] == true) {
            const $table_config = document.createElement('table');
            $table_config.classList.add('servtable');
            $config.appendChild($table_config)
            for (key in json['params']) {
                //index = controls_RU(key)
                let row = document.createElement('tr')
                $table_config.appendChild(row);
                let txt = document.createElement('th');
                let data = document.createElement('th');
                txt.textContent=json['param'][key];
                data.textContent=json['value'][key];
                row.appendChild(txt);
                row.appendChild(data);
            };
            
        };*/
    
    $('#servcontrol').removeClass('hidden');
};

function controls_RU(value){
    switch(value) {
        case('bind_version'): return 'Версия BIND';
        case('core'): return 'Ориентация';
        case('hostname'): return 'Адрес узла';
        case('user'): return 'Пользователь';
        default: return 'Неизвестно';
    };
};

function servcontrol_close(){
    $('#servcontrol').addClass('hidden');
    const $body = document.querySelector('#servcontrol_front');
    $body.textContent='';
};