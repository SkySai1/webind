function get_object_list(skip, command){
    if (skip < 1){
        $('#preloader').addClass('preloader-right');
        $('#preloader').addClass('preloader-active');
        $('.right_pannel').removeClass("right_pannel_move");
        clearTimeout(window.vanish);
    }
    var data = $.ajax({
        url:'/',
        method: 'POST',
        dataType: 'html',
        data: command
        })
        .done (function(data){
            if (data == 'failure'){
                response_handler(data);
                stop();
            }
            getObjectOptsList(command['status']);
            console.log(JSON.parse(data))
            sessionStorage.setItem('objectData', data);
            if (skip < 2) {
                switch(command['status']){
                    case 'view':
                        makeView();
                        block = '#views'
                        break;
                    case 'zone':
                        makeZones();
                        block = '#zones'
                        break;
                }  
            }
            if (skip < 1) {
                $('#preloader').addClass('opacity');
                window.vanish = setTimeout(function(){
                    $('#preloader').removeClass('preloader-active');
                    $('#preloader').removeClass('preloader-right');
                    $('#preloader').removeClass('opacity');
                    rightshow(block)
                },300);
            };
            return data
        })
        .fail (function(){

        });
    return data
};

function closeobject(id){
    let body = document.getElementById(id+'Info');  
    $('#'+id+'Info').css('height', '0vh')
    $('#'+id+'Main').css('height', '80vh')
    window.vanish = setTimeout(function(){
        body.textContent=''
    },200);

}

function getObjectOptsList(status){
    data= {
        'status': status,
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
                sessionStorage.setItem('objectOptsList', JSON.stringify(json))
            }
            catch {
                response_handler(data);
            };
        })
        .fail(function(){
            alert('Внутрення ошибка, перезагрузите страницу!');
        });
};

function transpose(matrix) {
    return Object.keys(matrix[0]).map(function(c) {
        return matrix.map(function(r) { return r[c]; });
    });
}

function imgButton(image, size){
    let button = document.createElement('button'); //Кнопка
    let img = document.createElement('div'); //Иконка
    //img.classList.add('svg-img-24x24');
    img.classList.add(image);
    button.classList.add('svg-btn');
    button.type='button';
    button.style.width = size;
    button.style.height = size;
    button.appendChild(img);
    return button
};

function makeTable(header, fields){
    let table = document.createElement('table'); //таблица

    // -- Заголовок таблицы --
    let hRow = document.createElement('tr');
    for (let i in header){
        let field = document.createElement('th');
        field.textContent=header[i];
        hRow.appendChild(field)
    }
    table.appendChild(hRow);
    //
    // -- Содержание таблицы --
    matrix = transpose(fields); //Транспонируем матрицу
    for (let r in matrix){ //Для каждой строки
        let row = document.createElement('tr');
        for (v in matrix[r]){ //Для каждого элементами строки
            let field = document.createElement('td');
            if (matrix[r][v].nodeType){
                field.appendChild(matrix[r][v])
            } else {
                field.textContent=matrix[r][v];
            }
            row.appendChild(field)
        }
        table.appendChild(row);
    }
    return table;
}

function expandDetail(object, id, titleText, subtitileText){
    $('#'+object+'Main').css('height', '15vh'); //Уменьшить высоту основной таблицы
    $('#'+object+'Info').css('height', '62vh'); //Увеличить высоту блока инфо
    sessionStorage.setItem(object+'ID', id); //Сохраним ID View в сессию
    let json = JSON.parse(sessionStorage.getItem('objectData')); //Получаем выгрузку обзоров из кэша
    let body = document.getElementById(object+'Info'); //иницалиизруем контейнер
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
    hButton.onclick=function(){closeobject(object);}; //Закрытие обзора
    title.textContent=titleText; //Имя обзора
    alias.textContent=subtitileText; //Описание обзора
    titleBlock.appendChild(title); //Имя -> Блок заголовка
    titleBlock.appendChild(alias); //Описание -> Блок заголовка
    header.appendChild(titleBlock); //Блог заголовка -> Заголовок
    header.appendChild(hButton); //Кнопка -> Заголовок
    body.appendChild(header); //Заголовок -> основной контейнер
    let front = document.createElement('div'); //Тело с инфо таблицами
    front.classList.add('objectInfoFront');
    body.appendChild(front);

    // -- Футер
    let footer = document.createElement('div');
    footer.classList.add('objectInfoFooter')
    body.appendChild(footer);

    let deleter = document.createElement('button');
    deleter.classList.add('minibutton')
    deleter.classList.add('deleter')
    deleter.type='button';
    deleter.textContent='Удалить';
    deleter.onclick=function(){deleteObject(object, id)};
    footer.appendChild(deleter);

    return front

}

function newRow(table, fields){
    let fRow = table.childNodes[1];
    let row = document.createElement('tr');
    for (i in fields){
        let field = document.createElement('td');
        if (fields[i].nodeType){
            field.appendChild(fields[i])
        } else {
            field.textContent=fields[i];
        }
        row.appendChild(field)
    }
    row.classList.add('newRow');
    fRow.after(row);
    window.vanish = setTimeout(function(){
        row.classList.remove('newRow');
        row.style.transition = '0.5s';
    },500);
}

function rowEdit(row, edit, data){
    switch(edit){
        case true:
            var data = {
                'option': row.childNodes[0].textContent, //Получаем значение имени
                'value': row.childNodes[1].textContent, //Получаем значение значения
                'action': row.childNodes[2].childNodes[0] //Сохраняем старую кнопку
            }
            let iValue = document.createElement('textarea'); //Создаём поле ввода значения
            let save = imgButton('img-save', '24px'); //Кнопка сохранения
            let cancel = imgButton('img-cancel', '24px'); //Кнопка отмены
            let trash = imgButton('img-trash', '24px') //Кнопка удаления
            let form = document.createElement('form'); //Форма изменений
            let option = document.createElement('input'); //Имя опции
            form.id='rowEdit-form';
            option.type='hidden';
            option.name='name';
            option.value=data['option'];
            option.setAttribute('form', 'rowEdit-form');
            cancel.onclick=function(){rowEdit(row, false, data)};
            iValue.name='value' //Ключ значения для формы
            iValue.onkeydown=function(){dynamicheight(this)};
            iValue.onchange=function(){dynamicheight(this)};
            iValue.value=data['value'];
            iValue.setAttribute('form', 'rowEdit-form');
            save.setAttribute('form', 'rowEdit-form');
            trash.setAttribute('form', 'rowEdit-form');
            form.appendChild(option);
            row.appendChild(form);
            row.classList.add('editRow');
            row.childNodes[1].textContent='';
            row.childNodes[1].appendChild(iValue); //Меняем строку на поле
            row.childNodes[2].textContent='';
            row.childNodes[2].appendChild(save);
            row.childNodes[2].appendChild(cancel);
            row.childNodes[2].appendChild(trash);
            actives = [save, trash];
            return actives
            break;
        case false:
            row.classList.remove('editRow');
            row.childNodes[2].textContent=''; //Обнуляем ячйеку с кнопкой
            row.childNodes[2].appendChild(data['action']); //Восстанавливаем кнпоку
            row.childNodes[0].textContent=data['option']; //Восстанавливаем имя
            row.childNodes[1].textContent=data['value']; //Восстанавливаем значение
            break;

    }
    
}

function deleteRow(row){
    row.classList.add('delRow');
    row.style.opacity = '0';
    row.style.transition = '1s';
    window.vanish = setTimeout(function(){
        row.remove();
    },1000);
}

function updateRow(row, json) {
    row.classList.add('updateRow');
    let button = imgButton('img-pencil', '24px');
    button.onclick=function(){viewOptEdit(this)};
    data = {
        'option': json['config'],
        'value': json['value'],
        'action': button
    }
    rowEdit(row, false, data)
    window.vanish = setTimeout(function(){
        row.style.transition = '0.5s';
        row.classList.remove('updateRow');
    },500);
}


function lefttooltip(open){
    let tooltip = document.getElementById('tooltip');
    let body = tooltip.childNodes[3];
    body.textContent='';
    switch(open){
        case true:
            tooltip.classList.remove('hidden');
            //tooltip.onblur=function(){lefttooltip(false)};
            data = JSON.parse(sessionStorage.getItem('objectOptsList'));
            header = ['Параметр', 'Описание']
            option = []
            desc = []
            action = []
            for (let key in data){
                option.push(key);
                desc.push(data[key]);
                let button = imgButton('img-right', '24px') 
                button.onclick=function(){
                    oName = this.parentNode.parentNode.childNodes[0].textContent;
                    document.getElementById('obejctNewOptName').value=oName;
                };
                action.push(button)
            }
            fields = [option, desc, action];
            let table = makeTable(header, fields);
            body.appendChild(table);
            window.vanish = setTimeout(function(){
                tooltip.classList.add('tooltip_move');
            },10);
            break;
        case false:
            tooltip.classList.remove('tooltip_move');
            window.vanish = setTimeout(function(){
                tooltip.classList.add('hidden');;
            },300);
            break;
    }
}

function optsTable(front, id, data, actions){
    // --Объвление сущностей
    let mainBlock = document.createElement('div'); //Блок с таблицей и её названием
    let blockTitle = document.createElement('div'); //Блок заголовка
    let title = document.createElement('h3'); //Заголовок таблицы
    let div = document.createElement('div') //Блок таблицы
    //
    mainBlock.id = 'objectOptBlock'
    mainBlock.classList.add('objectOptBlock')
    title.textContent = 'Лист настроек';
    // -- Создадим поля ввода
    let form = document.createElement('form'); //Создадим форму
    form.id='buffForm-NewOpt'
    let iName = document.createElement('input'); //Создадим ввод имени
    iName.name='name';
    iName.id='obejctNewOptName'
    iName.onfocus=function(){lefttooltip(true)};
    iName.setAttribute('form','buffForm-NewOpt');
    let iValue = document.createElement('textarea'); //Создадим ввод описания
    iValue.onkeydown=function(){dynamicheight(this)};
    iValue.onchange=function(){dynamicheight(this)};
    iValue.name='value';
    iValue.setAttribute('form','buffForm-NewOpt');
    let iButton = actions[0];
    //
    // -- Строим таблицу опций
    var hedaer = ['Наименование', 'Значение'];
    var name = []
    var value = []
    var action = []
    name.push(iName);
    value.push(iValue);
    action.push(iButton);
    for (let key in data[id]['options']){
        let button = actions[1].cloneNode(true);
        name.push(key);
        value.push(data[id]['options'][key]);
        action.push(button);
    };
    fields = [name, value, action];
    table = makeTable(hedaer, fields);
    table.id='objectOptTable';
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

function deleteObject(object, id) {
    var isDelete = confirm("Удаление обзора разрушит все зависимые связи, вы уверены?");
    if (isDelete == true){
        switch(object){
            case 'views':
                data = {
                    'status':'view',
                    'action':'delete',
                    'id':id
                }
                break;
        };
        form_submit('', data);
    }
}