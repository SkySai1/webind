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
    //s
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

function showView(idname){
    //$('#viewsMain').addClass('viewsMain-close');
    $('#viewsMain').css('height', '15vh');
    $('#viewsInfo').css('height', '62vh');

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


    let hButton = document.createElement('button'); //Кнопка сокрытия
    let cImg = document.createElement('div'); //Иконка
    cImg.classList.add('svg-img-64x64');
    cImg.classList.add('img-down-64');
    hButton.onclick=function(){closeview();};
    hButton.classList.add('svg-btn-64');
    hButton.appendChild(cImg)

    title.textContent=idname;
    alias.textContent=json[idname]['alias'];

    let titleBlock = document.createElement('div')
    titleBlock.appendChild(title);
    titleBlock.appendChild(alias);

    header.appendChild(titleBlock);
    header.appendChild(hButton);

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
    id = idname;
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
        form_submit('', data);
    }
}

function makeViewOpts(front, json){
        idname = sessionStorage.getItem('viewID'); //Получаем ID Обзора
        let optBlock = document.createElement('div');
        optBlock.id = 'viewOptBlock'
        front.appendChild(optBlock)

        let blockTitle = document.createElement('div');

        let img = document.createElement('div'); //блок изображения
        img.classList.add('svg-img-24x24');
        img.classList.add('img-right');
        img.id='viewOptSwitch';

        let hButton = document.createElement('button')
        hButton.appendChild(img);
        hButton.classList.add('svg-btn');
        hButton.type = 'button';
        hButton.onclick=function(){viewOptsOpen(true, hButton)};

        let title = document.createElement('h3');
        title.textContent = 'Лист настроек';

        blockTitle.appendChild(title);
        blockTitle.appendChild(hButton);

        optBlock.appendChild(blockTitle);

        let div = document.createElement('div')
        optBlock.appendChild(div);

        let table = document.createElement('table');
        table.id='viewOptTable'
        div.appendChild(table);

        let hRow = document.createElement('tr');
        hRow.id='viewOptTableHeadRow'
        table.appendChild(hRow);


        let hName = document.createElement('th'); 
        let hValue = document.createElement('th');
        let hAction = document.createElement('th');
        hAction.classList.add('viewOptsEdit');
        hAction.classList.add('hidden');

        hName.textContent='Параметр';
        hValue.textContent='Значение';
        hRow.appendChild(hAction);
        hRow.appendChild(hName);
        hRow.appendChild(hValue);

        table.appendChild(hRow);
        //Наполнение таблицы
        for (key in json[idname]['options']) {
            let config = key;
            //Создание строки
            let row = document.createElement('tr');
            table.appendChild(row);

            //Создание ячеек
            let push = document.createElement('td'); //Ячейки кнопки
            let name = document.createElement('td'); //Наименование
            let value = document.createElement('td'); //Описание
            let img = document.createElement('div'); //блок изображения
            
            img.classList.add('svg-img-24x24');
            img.classList.add('img-pencil');

            //Функции новой кнопки
            let button = document.createElement('button'); //Кнопка
            button.classList.add('svg-btn');
            button.appendChild(img);
            button.onclick=function(){viewOptEdit(row, true)};


            push.classList.add('viewOptsEdit');
            push.classList.add('hidden');
            push.appendChild(button);

            //Наполнение ячеек контентом
            name.textContent=config;
            value.textContent=json[idname]['options'][config];

            //Вставка ранее созданных элементов в строку
            row.appendChild(push);
            row.appendChild(name);
            row.appendChild(value);
        };
}

function viewOptsOpen(open, button) {
    switch(open) {
        case true:
            $('#viewOptSwitch').removeClass('img-right');
            $('#viewOptSwitch').addClass('img-left');
            $('.viewInfo-front > div').addClass('hidden');
            $('#viewOptBlock').removeClass('hidden');
            $('#viewOptBlock').css('width', '100%');
            button.onclick=function(){viewOptsOpen(false, button)};
            $('.viewOptsEdit').removeClass('hidden');
            let iName = document.createElement('input'); //Поле имени
            let iValue = document.createElement('input'); //Поле Значения
            let iButton = document.createElement('button'); //Кнопка отправки
            let form = document.createElement('form')
            form.id ='newViewOptForm'
            iName.name='name';
            iName.style.width = '90%';
            $(iName).attr('form','newViewOptForm');
            iValue.name='value';
            $(iValue).attr('form','newViewOptForm');
            iValue.style.width = '90%';
            iButton.type='button';
            $(iButton).attr('form','newViewOptForm');
            iButton.classList.add('svg-btn');
            iButton.onclick=function(){newViewOpt(this.form, true);};

            let img = document.createElement('div');
            img.classList.add('svg-img-24x24');
            img.classList.add('img-plus');
            iButton.appendChild(img);

            let row = document.createElement('tr');
            row.id='viewOptRow-newOpt'

            let rName = document.createElement('td');
            let rValue = document.createElement('td');
            let rAction = document.createElement('td');
            rAction.classList.add('viewOptsEdit');

            rAction.appendChild(iButton);
            rName.appendChild(iName);
            rValue.appendChild(iValue);

            row.appendChild(rAction);
            row.appendChild(rName);
            row.appendChild(rValue);


            let hRow = document.querySelector('#viewOptTableHeadRow');
            hRow.after(form);
            hRow.after(row);
            break;
        case false:
            $('#viewOptSwitch').removeClass('img-left');
            $('#viewOptSwitch').addClass('img-right');
            $('.viewOptsEdit').addClass('hidden');
            $('.viewInfo-front > div').removeClass('hidden');
            $('#viewOptBlock').css('width', '40vw');
            button.onclick=function(){viewOptsOpen(true, button)};
            let oRow = document.querySelector('#viewOptRow-newOpt');
            get_views_list(0);
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
            let push = document.createElement('td');
            let name = document.createElement('td');
            let value = document.createElement('td');
            let img = document.createElement('div'); //блок изображения
            
            img.classList.add('svg-img-24x24');
            img.classList.add('img-pencil');

            //Функции новой кнопки
            let button = document.createElement('button'); //Кнопка
            button.classList.add('svg-btn');
            button.appendChild(img);
            button.onclick=function(){viewOptEdit(row, true)};


            push.classList.add('viewOptsEdit');
            push.appendChild(button);

            name.textContent=opt;
            value.textContent=val;

            row.appendChild(push);
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

function viewOptEdit(row, edit, data){
    switch(edit)
    {
        case(true):
            let form = document.createElement('form'); //Объявляем форму
            form.id ='viewOptEditForm'; //Присваеваем ID
            let option = row.childNodes[1].textContent; //Получаем значение имени
            let value = row.childNodes[2].textContent; //Получаем значение значения
            let action = row.childNodes[0].childNodes[0]; //Сохраняем старую кнопку

            data = {
                'option': option,
                'value': value,
                'action': action
            }
            let iValue = document.createElement('input'); //Создаём поле ввода значения
            iValue.name='value' //Ключ значения для формы
            $(iValue).attr('form', '#viewOptEditForm'); //Привязаем значение к форме
            $(iValue).val(value); //Присваем значение

            let cImg = document.createElement('div'); //Рисунок кнопки отмены
            cImg.classList.add('svg-img-24x24');
            cImg.classList.add('img-cancel');

            let sImg = document.createElement('div'); //Рисунок кнопки отмены
            sImg.classList.add('svg-img-24x24');
            sImg.classList.add('img-save');
            

            let cButton = document.createElement('button'); //Создаём кнопку отмены
            cButton.type='button'; //Явно указываем кнопку
            cButton.onclick=function(){viewOptEdit(row, false, data)}; //Функция отмены
            cButton.appendChild(cImg);
            cButton.classList.add('svg-btn')

            let sendButton = document.createElement('button'); //Создаём кнопку отправки
            sendButton.type='button'; //Явно указываем кнопку
            sendButton.setAttribute('form', '#viewOptEditForm'); //Отпарвка формы
            sendButton.appendChild(sImg);
            sendButton.classList.add('svg-btn');

            row.appendChild(form); //Вставляем форму
            row.childNodes[0].textContent=''; //Обнуляем первую ячейку
            row.childNodes[0].appendChild(cButton);
            row.childNodes[0].appendChild(sendButton); //Добавляем кнопку сохранения
            row.childNodes[2].textContent=''; // Обнуляем значение в ячейке
            row.childNodes[2].appendChild(iValue)  //Вставляем в ячейку поле значения
            break;
        case(false):
            row.childNodes[0].textContent=''; //Обнуляем ячйеку с кнопкой
            row.childNodes[0].appendChild(data['action']); //Восстанавливаем кнпоку
            row.childNodes[1].textContent=data['option']; //Восстанавливаем имя
            row.childNodes[2].textContent=data['value']; //Восстанавливаем значение

    };
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