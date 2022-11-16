function get_views_list(skip){
    if (skip == false){
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
            makeView()
            if (skip == false) {
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
    iButton.onclick=function(){newView(this.form);};

    name.appendChild(iName);
    alias.appendChild(iAlias);
    insert.appendChild(iButton);

    row.appendChild(empty);
    row.appendChild(name);
    row.appendChild(alias);
    row.appendChild(insert);

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
    let alias = document.createElement('h2');

    title.textContent=idname;
    alias.textContent=json[idname]['alias'];

    header.appendChild(title);
    header.appendChild(alias);

    body.appendChild(header);

    //Центральная панель
    let front = document.createElement('div');
    front.classList.add('viewInfo-front');
    body.appendChild(front);
    
    //Создание таблицы параметров
    makeViewOpts(front, json, idname)

    //Создание таблицы подключенных серверов
    makeViewServers(front, json, idname)

    //Создание таблицы зависимых зон
    makeViewZones(front, json, idname)

    //Панель кнопок
    id = idname.split(':')[0];
    let footer = document.createElement('div');
    footer.classList.add('viewInfo-footer')
    body.appendChild(footer);

    let deleter = document.createElement('button');
    deleter.type='button';
    deleter.textContent='Удалить';
    deleter.onclick=function(){deleteView(id)};
    footer.appendChild(deleter);

};

function newView(form){
    var olddata = $(form).serialize().split('&');
    olddata.push('status=view');
    olddata.push('action=new');
    newdata = olddata.join('&');
    form_submit(form, newdata);
}

function deleteView(id) {
    data = {
        'status':'view',
        'action':'delete',
        'id':id
    }
    form_submit('', data)
}

function makeViewOpts(front, json, idname){
        let optBlock = document.createElement('div');
        front.appendChild(optBlock)

        let title = document.createElement('h3');
        title.textContent = 'Лист настроек';
        optBlock.appendChild(title);

        let table = document.createElement('table');
        optBlock.appendChild(table);

        let row = document.createElement('tr');
        table.appendChild(row);

        let hName = document.createElement('th'); 
        let hValue = document.createElement('th');
        hName.textContent='Параметр';
        hValue.textContent='Значение';
        row.appendChild(hName);
        row.appendChild(hValue);
        table.appendChild(row);
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
            name.textContent=config;
            value.textContent=json[idname]['options'][config];

            //Вставка ранее созданных элементов в строку
            push.appendChild(button);
            row.appendChild(name);
            row.appendChild(value);
            row.appendChild(push);
        };
}

function makeViewServers(front, json, idname){
        let servBlock = document.createElement('div');
        front.appendChild(servBlock)

        let title = document.createElement('h3');
        title.textContent = 'Подключенные серверы';
        servBlock.appendChild(title);

        let table = document.createElement('table');
        servBlock.appendChild(table);

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

function makeViewZones(front, json, idname){
    let zonesBlock = document.createElement('div');
    front.appendChild(zonesBlock)

    let title = document.createElement('h3');
    title.textContent = 'Зависимые зоны';
    zonesBlock.appendChild(title);

    let table = document.createElement('table');
    zonesBlock.appendChild(table);

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