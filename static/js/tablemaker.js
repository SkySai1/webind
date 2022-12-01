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
    for (key in tooltip.childNodes) { console.log(tooltip.childNodes[key])};
    switch(open){
        case true:
            tooltip.classList.remove('hidden');
            //tooltip.onblur=function(){lefttooltip(false)};
            data = JSON.parse(sessionStorage.getItem('viewsOptsList'));
            header = ['Параметр', 'Описание']
            option = []
            desc = []
            for (let key in data){
                option.push(key);
                desc.push(data[key]); 
            }
            fields = [option, desc];
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