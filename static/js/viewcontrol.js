function get_views_list(skip){
    if (skip < 1){
        $('#preloader').addClass('preloader-right');
        $('#preloader').addClass('preloader-active');
        $('.right_pannel').removeClass("right_pannel_move");
        clearTimeout(window.vanish);
    }
    data ={
        'status': 'view',
        'action': 'getviews'
    }
    $.ajax({
        url:'/',
        method: 'POST',
        dataType: 'html',
        data: data
        })
        .done (function(data){
            if (data == 'failure'){
                response_handler(data);
                stop();
            }
            sessionStorage.setItem('viewsData', data);
            if (skip < 2) {
                makeView();
            }
            if (skip < 1) {
                $('#preloader').addClass('opacity');
                window.vanish = setTimeout(function(){
                    $('#preloader').removeClass('preloader-active');
                    $('#preloader').removeClass('preloader-right');
                    $('#preloader').removeClass('opacity');
                    rightshow('#views')
                },300);
            };
        })
        .fail (function(){

        });
};


function makeView(){
    let saved = sessionStorage.getItem('viewsData');
    var viewsList = JSON.parse(saved)
    console.log(viewsList)

    //Очитка содержимого
    const $info = document.querySelector('#viewsInfo')
    const $body = document.querySelector('#viewsMain')
    $body.textContent = '';
    $info.textContent = '';
    //Создание таблицы Обзоров
    const $views_table = document.createElement('table');
    //$views_table.classList.add('servtable');

    //Заголовок таблицы
    const $head = document.createElement('tr');
    $views_table.appendChild($head);
    const $id = document.createElement('th');
    const $name = document.createElement('th');
    const $alias = document.createElement('th')
    $id.textContent='ID';
    $name.textContent='Наименование';
    $alias.textContent='Описание';
    $head.appendChild($id);
    $head.appendChild($name);
    $head.appendChild($alias);

    //Создание строки добавления Обзора
    let row = document.createElement('tr'); //Новая строка
    let empty = document.createElement('td'); //Пустая ячейка
    let name = document.createElement('td'); //Наименование
    let alias = document.createElement('td'); //Описание
    let insert = document.createElement('td'); //Ячейки кнопки

    let form = document.createElement('form'); //Форма
    let iName = document.createElement('input'); //Поле имени
    let iAlias = document.createElement('input'); //Поле описания
    let iButton = document.createElement('button'); //Кнопка отправки

    //Создание формы добавления Обзора
    form.classList.add('form');
    form.id='newViewForm'
    $body.appendChild(form);
    
    iName.name='name';
    $(iName).attr('form','newViewForm');
    iAlias.name='alias';
    $(iAlias).attr('form','newViewForm');
    iButton.type='button';
    iButton.textContent='Создать';
    $(iButton).attr('form','newViewForm');
    iButton.onclick=function(){newView(this.form, true);};

    name.appendChild(iName);
    alias.appendChild(iAlias);
    insert.appendChild(iButton);

    row.appendChild(empty);
    row.appendChild(name);
    row.appendChild(alias);
    row.appendChild(insert);
    row.id='newViewRow'

    $views_table.appendChild(row);
    $body.appendChild($views_table)
    //Наполнение таблицы
    for (key in viewsList) {
        let view = key;
        viewCap = key.split(':');
        //Создание строки
        let row = document.createElement('tr');
        $views_table.appendChild(row);

        //Создание ячеек
        let id = document.createElement('td'); //ID Обзора
        let name = document.createElement('td'); //Наименование
        let alias = document.createElement('td'); //Описание
        let push = document.createElement('td'); //Ячейки кнопки
        

        //Функции новой кнопки
        let button = document.createElement('button'); //Кнопка
        button.textContent='Push';
        button.onclick=function(){showView(view);};

        //Наполнение ячеек контентом
        id.textContent=viewCap[0]+':';
        name.textContent=viewCap[1];
        alias.textContent=viewsList[key]['alias'];

        //Вставка ранее созданных элементов в строку
        push.appendChild(button);
        row.appendChild(id);
        row.appendChild(name);
        row.appendChild(alias);
        row.appendChild(push);
    };
}

function showView(idname){
    let saved = sessionStorage.getItem('viewsData');
    var json = JSON.parse(saved)

    //Создание формы
    let body = document.querySelector('#viewsInfo');
    body.textContent='';
    //Создание шапки
    let header = document.createElement('div');
    header.classList.add('viewInfo-hedaer');
    let title = document.createElement('h1');
    title.style.fontFamily = '\'current\'';
    title.style.color = '#186b8f';
    let alias = document.createElement('h2');
    alias.style.fontFamily = 'cursive';

    title.textContent=idname;
    alias.textContent=json[idname]['alias'];

    header.appendChild(title);
    header.appendChild(alias);

    body.appendChild(header);

    //Центральная панель
    let front = document.createElement('div');
    front.classList.add('viewInfo-front');
    body.appendChild(front);

    sessionStorage.setItem('viewID', idname) //Кэшируем ID отырктого обзора

    //Создание таблицы параметров
    makeViewOpts(front, json)
    
    //Создание таблицы подключенных серверов
    makeViewServers(front, json)

    //Создание таблицы зависимых зон
    makeViewZones(front, json)

    //Панель кнопок
    console.log(idname);
    id = idname.split(':')[0];
    let footer = document.createElement('div');
    footer.classList.add('viewInfo-footer')
    body.appendChild(footer);

    let deleter = document.createElement('button');
    deleter.classList.add('minibutton')
    deleter.classList.add('deleter')
    deleter.type='button';
    deleter.textContent='Удалить';
    deleter.onclick=function(){deleteView()};
    footer.appendChild(deleter);

};

function newView(form, send, json){
    switch(send){
        case true:
            var olddata = $(form).serialize().split('&');
            olddata.push('status=view');
            olddata.push('action=new');
            newdata = olddata.join('&');
            getNewView(form, newdata);
            break;
        case false:
            form.reset();
            let view = json['viewname'];
            let alias = json['alias'];
            let id = json['id']

            let idView = id+': '+view;
            let firstRow = document.querySelector('#newViewRow');

            let row = document.createElement('tr');

            let dId = document.createElement('td');
            let dView = document.createElement('td');
            let dAlias = document.createElement('td');
            let dButton = document.createElement('td');
            
            let button = document.createElement('button');
            button.type='button';
            button.textContent='Push';
            button.onclick=function(){showView(idView);};

            

            dId.textContent=id
            dView.textContent=view;
            dAlias.textContent=alias;
            dButton.appendChild(button);

            row.appendChild(dId);
            row.appendChild(dView);
            row.appendChild(dAlias);
            row.appendChild(dButton);
            row.style.transition = 'all 1s';
            row.classList.add('newOpt');

            firstRow.after(row);

            window.vanish = setTimeout(function(){
                row.classList.remove('newOpt');;
            },200);
            break;
    }
}

function getNewView(form, data) {
    $.ajax({
        url:'/',
        method: 'POST',
        dataType: 'html',
        data: data
        })
        .done(function(data) {
            if (data == 'empty_serv_field' || data == 'failure') {
                response_handler(data, form);
            } else {
                json = JSON.parse(data);
                newView(form, false, json);
                get_views_list(2);
            }
        })
        .fail(function(){
            alert('Внутрення ошибка, перезагрузите страницу!');
        });
}

function deleteView() {
    var isDelete = confirm("Удаление обзора разрушит все зависимые связи, вы уверены?");
    if (isDelete == true){
        id = sessionStorage.getItem('viewID').split(':')[0]
        data = {
            'status':'view',
            'action':'delete',
            'id':id

        };
        console.log(data);
        form_submit('', data)
    }
}

function makeViewOpts(front, json){
        idname = sessionStorage.getItem('viewID'); //Получаем ID Обзора
        let optBlock = document.createElement('div');
        optBlock.id = 'viewOptBlock'
        front.appendChild(optBlock)

        let title = document.createElement('h3');
        title.textContent = 'Лист настроек';
        optBlock.appendChild(title);

        let div = document.createElement('div')
        optBlock.appendChild(div);

        let table = document.createElement('table');
        table.id='viewOptTable'
        div.appendChild(table);

        let hRow = document.createElement('tr');
        hRow.id='viewOptTableHeadRow'
        table.appendChild(hRow);

        let hButton = document.createElement('button')
        hButton.textContent = 'Open';
        hButton.type = 'button';
        hButton.onclick=function(){viewOptsOpen(true, hButton)};

        let hName = document.createElement('th'); 
        let hValue = document.createElement('th');
        let hAction = document.createElement('th');
        

        hName.textContent='Параметр';
        hValue.textContent='Значение';
        //hAction.appendChild(hButton);
        hRow.appendChild(hName);
        hRow.appendChild(hValue);
        //hRow.appendChild(hAction);
        title.appendChild(hButton);

        table.appendChild(hRow);
        //Наполнение таблицы
        for (key in json[idname]['options']) {
            let config = key;
            //Создание строки
            let row = document.createElement('tr');
            table.appendChild(row);

            //Создание ячеек
            let name = document.createElement('td'); //Наименование
            let value = document.createElement('td'); //Описание
            let push = document.createElement('td'); //Ячейки кнопки
            

            //Функции новой кнопки
            let button = document.createElement('button'); //Кнопка
            button.textContent='Push';
            button.onclick=function(){};

            //Наполнение ячеек контентом
            name.textContent=config+':';
            value.textContent=json[idname]['options'][config];

            //Вставка ранее созданных элементов в строку
            push.appendChild(button);
            row.appendChild(name);
            row.appendChild(value);
            //row.appendChild(push);
        };
}

function viewOptsOpen(open, button) {
    switch(open) {
        case true:
            button.onclick=function(){viewOptsOpen(false, button)};
            let iName = document.createElement('input'); //Поле имени
            let iValue = document.createElement('input'); //Поле Значения
            let iButton = document.createElement('button'); //Кнопка отправки
            let form = document.createElement('form')
            form.id ='newViewOptForm'
            iName.name='name';
            $(iName).attr('form','newViewOptForm');
            //iName.style.width = '90%';
            iValue.name='value';
            $(iValue).attr('form','newViewOptForm');
            iValue.style.width = '90%';
            iButton.type='button';
            iButton.textContent='+';
            iButton.style.float = 'left';
            $(iButton).attr('form','newViewOptForm');
            console.log(idname);
            iButton.onclick=function(){newViewOpt(this.form, true);};

            let row = document.createElement('tr');
            row.id='viewOptRow-newOpt'

            let rName = document.createElement('td');
            let rValue = document.createElement('td');

            rName.appendChild(iButton);
            rName.appendChild(iName);
            rValue.appendChild(iValue);

            row.appendChild(rName);
            row.appendChild(rValue);
            //row.appendChild(rButton);

            let hRow = document.querySelector('#viewOptTableHeadRow');
            hRow.after(form);
            hRow.after(row);
            break;
        case false:
            button.onclick=function(){viewOptsOpen(true, button)};
            let oRow = document.querySelector('#viewOptRow-newOpt');
            
            oRow.remove();
            break;
    }
}

function newViewOpt(form, send, buffer) {
    switch(send){
        case true:
            idname = sessionStorage.getItem('viewID'); //Получаем ID Обзора
            id = idname.split(':')
            data = $(form).serialize().split('&');
            data.push('viewID='+id[0])
            data.push('status=view')
            data.push('action=newopt')
            newdata = data.join('&')
            getNewViewOpt(form, newdata);
            break;
        case false:
            form.reset();
            opt = buffer['option'];
            val = buffer['value'];

            let firstRow = document.querySelector('#viewOptRow-newOpt');

            let row = document.createElement('tr');
            let name = document.createElement('td');
            let value = document.createElement('td');

            name.textContent=opt;
            value.textContent=val;

            row.appendChild(name);
            row.appendChild(value);
            row.style.transition = 'all 1s';
            row.classList.add('newOpt');

            firstRow.after(row);

            window.vanish = setTimeout(function(){
                row.classList.remove('newOpt');;
            },200);
            break;
    };
};

function getNewViewOpt(form, data){
    $.ajax({
        url:'/',
        method: 'POST',
        dataType: 'html',
        data: data
        })
        .done(function(data) {
            if (data == 'bad_view_opt' || data == 'view_opt_exist' || data == 'empty_serv_field') {
                response_handler(data, form);
            } else {
                json = JSON.parse(data);
                newViewOpt(form, false, json);
                get_views_list(2);
            }
        })
        .fail(function(){
            alert('Внутрення ошибка, перезагрузите страницу!');
        });
};

function makeViewServers(front, json){
        idname = sessionStorage.getItem('viewID'); //Получаем ID Обзора
        let servBlock = document.createElement('div');
        front.appendChild(servBlock)

        let title = document.createElement('h3');
        title.textContent = 'Подключенные серверы';
        servBlock.appendChild(title);

        let div = document.createElement('div')
        servBlock.appendChild(div);

        let table = document.createElement('table');
        table.id='viewServTable'
        div.appendChild(table);

        let row = document.createElement('tr');
        table.appendChild(row);

        let hHost = document.createElement('th'); 
        let hId = document.createElement('th');
        hId.textContent='ID';
        hHost.textContent='Адрес';
        row.appendChild(hId);
        row.appendChild(hHost);
        table.appendChild(row);
        //Наполнение таблицы
        for (let key in json[idname]['servers']) {

            let sInfo = json[idname]['servers'][key].split(':')
            
            //Создание строки
            let row = document.createElement('tr');
            table.appendChild(row);

            //Создание ячеек
            let id = document.createElement('td'); //ID в базе
            let name = document.createElement('td'); //Наименование                

            //Наполнение ячеек контентом
            id.textContent=sInfo[0];
            name.textContent=sInfo[1];

            //Вставка ранее созданных элементов в строку
            row.appendChild(id);
            row.appendChild(name);
        };
};

function makeViewZones(front, json){
    idname = sessionStorage.getItem('viewID'); //Получаем ID Обзора

    let zonesBlock = document.createElement('div');
    front.appendChild(zonesBlock)

    let title = document.createElement('h3');
    title.textContent = 'Зависимые зоны';
    zonesBlock.appendChild(title);

    let div = document.createElement('div')
    zonesBlock.appendChild(div);

    let table = document.createElement('table');
    table.id='viewZonesTable'
    div.appendChild(table);

    let row = document.createElement('tr');
    table.appendChild(row);

    let hHost = document.createElement('th'); 
    let hId = document.createElement('th');
    hId.textContent='ID';
    hHost.textContent='FQDN';
    row.appendChild(hId);
    row.appendChild(hHost);
    table.appendChild(row);
    //Наполнение таблицы
    for (let key in json[idname]['zones']) {

        let zInfo = key.split(':');
        //Создание строки
        let row = document.createElement('tr');
        table.appendChild(row);

        //Создание ячеек
        let id = document.createElement('td'); //ID в базе
        let name = document.createElement('td'); //Наименование                

        //Наполнение ячеек контентом
        id.textContent=zInfo[0];
        name.textContent=zInfo[1];

        //Вставка ранее созданных элементов в строку
        row.appendChild(id);
        row.appendChild(name);
    };
};