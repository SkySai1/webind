function get_views_list(skip){
    if (skip < 1){
        $('#preloader').addClass('preloader-right');
        $('#preloader').addClass('preloader-active');
        $('.right_pannel').removeClass("right_pannel_move");
        getViewOptsList();
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
    closeview();
    // -- Выводим полученный список Обзоров --
    let saved = sessionStorage.getItem('viewsData');
    var viewsList = JSON.parse(saved);
    console.log(viewsList);
    //

    let mainBlock = document.getElementById('viewsMain'); //Получаем блок с осн. таблицей
    mainBlock.textContent='';
    header=['ID', 'Наименование', 'Краткое описание', '']; //Создаём заголовок
    
    // -- Создадим поля ввода
    let form = document.createElement('form'); //Создадим форму
    form.id='buffForm'
    let iName = document.createElement('input'); //Создадим ввод имени
    iName.name='name';
    iName.setAttribute('form','buffForm');
    let iAlias = document.createElement('input'); //Создадим ввод описания
    iAlias.name='alias';
    iAlias.setAttribute('form','buffForm');
    let iButton = imgButton('img-plus', '24px');
    iButton.setAttribute('form','buffForm');
    iButton.type='button';
    iButton.onclick=function(){newView(this.form, true);};
    //
    // -- Создадим массив полей --
    id = []
    viewname = []
    alias = []
    action = []
    id.push('');
    viewname.push(iName);
    alias.push(iAlias);
    action.push(iButton);
    for (let key in viewsList){
        id.push(key);
        viewname.push(viewsList[key]['viewname']);
        alias.push(viewsList[key]['alias']);

        // --Создадим кнопку раскрытия
        let button = imgButton('img-up', '24px');
        button.onclick=function(){showView(key);};
        //

        action.push(button)

    }
    fields = [id, viewname, alias, action];
    //

    mainTable = makeTable(header, fields);
    mainTable.classList.add('mainTable');
    mainTable.id='viewsTable'
    mainBlock.appendChild(mainTable);
    mainBlock.appendChild(form);
};

function showView(id){
    $('#viewsMain').css('height', '15vh'); //Уменьшить высоту основной таблицы
    $('#viewsInfo').css('height', '62vh'); //Увеличить высоту блока инфо
    sessionStorage.setItem('viewID', id); //Сохраним ID View в сессию
    let json = JSON.parse(sessionStorage.getItem('viewsData')); //Получаем выгрузку обзоров из кэша
    let body = document.getElementById('viewsInfo'); //иницалиизруем контейнер
    body.textContent='';
    let header = document.createElement('div'); //Создание шапки
    let titleBlock = document.createElement('div') //Блок заголовка
    header.classList.add('objectInfoHedaer'); 
    let title = document.createElement('h1'); //Создание заголовка
    title.style.fontFamily = '\'current\'';
    title.style.color = '#186b8f';
    let alias = document.createElement('h2'); //Создание описания
    alias.style.fontFamily = 'cursive';
    let hButton = imgButton('img-down-64', '64px'); //Создание кпноки
    hButton.onclick=function(){closeview();}; //Закрытие обзора
    title.textContent=json[id]['viewname']; //Имя обзора
    alias.textContent=json[id]['alias']; //Описание обзора
    titleBlock.appendChild(title); //Имя -> Блок заголовка
    titleBlock.appendChild(alias); //Описание -> Блок заголовка
    header.appendChild(titleBlock); //Блог заголовка -> Заголовок
    header.appendChild(hButton); //Кнопка -> Заголовок
    body.appendChild(header); //Заголовок -> основной контейнер
    let front = document.createElement('div'); //Тело с инфо таблицами
    front.classList.add('objectInfoFront');
    body.appendChild(front);

    makeViewOpts(front, id) //Таблица опций

    makeViewServers(front, id) //Таблица зависимых серверов

    makeViewZones(front, id) //Таблица подключенных зон

    // -- Футер
    let footer = document.createElement('div');
    footer.classList.add('objectInfoFooter')
    body.appendChild(footer);

    let deleter = document.createElement('button');
    deleter.classList.add('minibutton')
    deleter.classList.add('deleter')
    deleter.type='button';
    deleter.textContent='Удалить';
    deleter.onclick=function(){deleteView(id)};
    footer.appendChild(deleter);


}

function makeViewOpts(front, id){
    let json = JSON.parse(sessionStorage.getItem('viewsData')); //Получаем выгрузку обзоров из кэша
    // --Объвление сущностей
    let mainBlock = document.createElement('div'); //Блок с таблицей и её названием
    let blockTitle = document.createElement('div'); //Блок заголовка
    let title = document.createElement('h3'); //Заголовок таблицы
    let div = document.createElement('div') //Блок таблицы
    //
    mainBlock.id = 'viewOptBlock'
    mainBlock.classList.add('objectOptBlock')
    title.textContent = 'Лист настроек';
    // -- Создадим поля ввода
    let form = document.createElement('form'); //Создадим форму
    form.id='buffForm-NewOpt'
    let iName = document.createElement('input'); //Создадим ввод имени
    iName.name='name';
    iName.onfocus=function(){lefttooltip(true)};
    iName.setAttribute('form','buffForm-NewOpt');
    let iValue = document.createElement('textarea'); //Создадим ввод описания
    iValue.onkeydown=function(){dynamicheight(this)};
    iValue.onchange=function(){dynamicheight(this)};
    iValue.name='value';
    iValue.setAttribute('form','buffForm-NewOpt');
    let iButton = imgButton('img-plus', '24px');
    iButton.setAttribute('form','buffForm-NewOpt');
    iButton.type='button';
    iButton.onclick=function(){sendNewViewOpt(this.form, 'viewOptTable', id);};
    //
    // -- Строим таблицу опций
    var hedaer = ['Наименование', 'Значение'];
    var name = []
    var value = []
    var action = []
    name.push(iName);
    value.push(iValue);
    action.push(iButton);
    for (let key in json[id]['options']){
        let button = imgButton('img-pencil', '24px');
        button.onclick=function(){viewOptEdit(this)};
        name.push(key);
        value.push(json[id]['options'][key]);
        action.push(button);
    };
    fields = [name, value, action];
    table = makeTable(hedaer, fields);
    table.id='viewOptTable';
    table.classList.add('objectOptTable')
    table.appendChild(form);
    //
    // --Скеливание сущностей
    blockTitle.appendChild(title); //Заголовок -> Блок заголовка
    div.appendChild(table); //Таблица -> Блок таблицы
    mainBlock.appendChild(blockTitle); //Блок заголовка -> Блок с таблицей и её названием
    mainBlock.appendChild(div); //Блок таблицы -> Блок с таблицей и её названием
    front.appendChild(mainBlock) //Блок с таблицей и её названием -> Общий блок информации обзора
    //
}

function makeViewServers(front, id){
    let json = JSON.parse(sessionStorage.getItem('viewsData')); //Получаем выгрузку обзоров из кэша
    // --Объвление сущностей
    let mainBlock = document.createElement('div'); //Блок с таблицей и её названием
    let blockTitle = document.createElement('div'); //Блок заголовка
    let title = document.createElement('h3'); //Заголовок таблицы
    let div = document.createElement('div') //Блок таблицы
    //
    mainBlock.id = 'viewServBlock'
    title.textContent = 'Зависимые серверы';
    // -- Строим таблицу серверов
    var hedaer = ['Адрес'];
    var value = []
    for (key in json[id]['servers']){
        value.push(json[id]['servers'][key]);
    };
    fields = [value];
    table = makeTable(hedaer, fields);
    table.id='viewServTable';
    table.classList.add('objectServTable')
    //
    // --Скеливание сущностей
    blockTitle.appendChild(title); //Заголовок -> Блок заголовка
    div.appendChild(table); //Таблица -> Блок таблицы
    mainBlock.appendChild(blockTitle); //Блок заголовка -> Блок с таблицей и её названием
    mainBlock.appendChild(div); //Блок таблицы -> Блок с таблицей и её названием
    front.appendChild(mainBlock) //Блок с таблицей и её названием -> Общий блок информации обзора
    //
}

function makeViewZones(front, id){
    let json = JSON.parse(sessionStorage.getItem('viewsData')); //Получаем выгрузку обзоров из кэша
    // --Объвление сущностей
    let mainBlock = document.createElement('div'); //Блок с таблицей и её названием
    let blockTitle = document.createElement('div'); //Блок заголовка
    let title = document.createElement('h3'); //Заголовок таблицы
    let div = document.createElement('div') //Блок таблицы
    //
    mainBlock.id = 'viewZonesBlock'
    title.textContent = 'Подключенные зоны';
    // -- Строим таблицу зон
    var hedaer = ['Домен'];
    var value = []
    for (key in json[id]['zones']){
        value.push(key);
    };
    fields = [value];
    table = makeTable(hedaer, fields);
    table.id='viewZonesTable';
    table.classList.add('objectZonesTable')
    //
    // --Скеливание сущностей
    blockTitle.appendChild(title); //Заголовок -> Блок заголовка
    div.appendChild(table); //Таблица -> Блок таблицы
    mainBlock.appendChild(blockTitle); //Блок заголовка -> Блок с таблицей и её названием
    mainBlock.appendChild(div); //Блок таблицы -> Блок с таблицей и её названием
    front.appendChild(mainBlock) //Блок с таблицей и её названием -> Общий блок информации обзора
    //
}

function closeview(){
    let body = document.querySelector('#viewsInfo');  
    $('#viewsInfo').css('height', '0vh')
    $('#viewsMain').css('height', '80vh')
    window.vanish = setTimeout(function(){
        body.textContent=''
    },200);

}

function newView(form, send, json){
    switch(send){
        case true:
            var olddata = $(form).serialize().split('&');
            console.log(olddata);
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
            // --Создадим кнопку раскрытия
            let button = imgButton('img-up', '24px');
            button.onclick=function(){showView(id);};
            //
            fields = [id, view, alias, button]
            let table = document.getElementById('viewsTable');
            newRow(table, fields);
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

function deleteView(id) {
    var isDelete = confirm("Удаление обзора разрушит все зависимые связи, вы уверены?");
    if (isDelete == true){
        data = {
            'status':'view',
            'action':'delete',
            'id':id

        };
        form_submit('', data);
    }
}

function sendNewViewOpt(form, tableID, id){
    data = $(form).serialize().split('&');
    data.push('viewID='+id);
    data.push('status=view');
    data.push('action=newopt');
    newdata = data.join('&');
    getNewViewOpt(form, newdata, tableID);
}

function appendNewViewOpt(form, json, tableID){
    form.reset();
    let table = document.getElementById(tableID);
    let button = imgButton('img-pencil', '24px');
    button.onclick=function(){viewOptEdit(this)};
    var fields = [json['option'], json['value'], button];
    newRow(table, fields);
}

function getNewViewOpt(form, data, tableID){
    $.ajax({
        url:'/',
        method: 'POST',
        dataType: 'html',
        data: data
        })
        .done(function(data) {
            try {
                json = JSON.parse(data);
                console.log(json);
                appendNewViewOpt(form, json, tableID);
                get_views_list(2);
            }
            catch{
                response_handler(data, form);
            };
        })
        .fail(function(){
            alert('Внутрення ошибка, перезагрузите страницу!');
        });
};

function viewOptEdit(cell){
    let row = cell.parentNode.parentNode;
    let buttons = rowEdit(row, true);
    buttons[0].onclick=function(){viewOptUpdate(this.form, row)};
    buttons[1].onclick=function(){viewOptRemove(this.form, row)};
}

function viewOptUpdate(form, row){
    var vId = sessionStorage.getItem('viewID');
    data = $(form).serialize().split('&');
    data.push('status=view');
    data.push('action=update_opt');
    data.push('id='+vId);
    var newdata = data.join('&');
    $.ajax({
        url:'/',
        method: 'POST',
        dataType: 'html',
        data: newdata
        })
        .done(function(data) {
            try {
                json = JSON.parse(data)
                updateRow(row, json)
            }
            catch {
                response_handler(data);
            };
        })
        .fail(function(){
            alert('Внутрення ошибка, перезагрузите страницу!');
        });
}

function viewOptRemove(form, row){
    var vId = sessionStorage.getItem('viewID');
    data = $(form).serialize().split('&');
    data.push('status=view');
    data.push('action=remove_opt');
    data.push('id='+vId);
    var newdata = data.join('&');
    $.ajax({
        url:'/',
        method: 'POST',
        dataType: 'html',
        data: newdata
        })
        .done(function(data) {
            if (data == 'viewOptRemove_success') {
                deleteRow(row);
            }
            else{
                response_handler(data, form);
            };
        })
        .fail(function(){
            alert('Внутрення ошибка, перезагрузите страницу!');
        });
}

function getViewOptsList(){
    data= {
        'status': 'view',
        'action': 'show_opts'
    };
    $.ajax({
        url:'/',
        method: 'POST',
        dataType: 'html',
        data: data
        })
        .done(function(data) {
            try {
                json = JSON.parse(data)
                sessionStorage.setItem('viewsOptsList', JSON.stringify(json))
            }
            catch {
                response_handler(data);
            };
        })
        .fail(function(){
            alert('Внутрення ошибка, перезагрузите страницу!');
        });
}