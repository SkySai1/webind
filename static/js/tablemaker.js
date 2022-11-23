function get_block_list(skip, type){
    if (skip < 1){
        $('#preloader').addClass('preloader-right');
        $('#preloader').addClass('preloader-active');
        $('.right_pannel').removeClass("right_pannel_move");
        clearTimeout(window.vanish);
    }
    switch(type){
        case 'view':
            data ={
                'status': 'view',
                'action': 'getviews'
            }
            break;
    };
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
            sessionStorage.setItem('blockData', data);
            if (skip < 2) {
                makeBlock(type);
            }
            if (skip < 1) {
                $('#preloader').addClass('opacity');
                window.vanish = setTimeout(function(){
                    $('#preloader').removeClass('preloader-active');
                    $('#preloader').removeClass('preloader-right');
                    $('#preloader').removeClass('opacity');
                },300);
            };
        })
        .fail (function(){

        });
};

function makeBlock(type){
    switch(type){
        case 'view':
            makeMainTable('views', 'alias', type);
            rightshow('#object');
    };
    
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
    console.log(fields);
    console.log(transpose(fields));
    // -- Содержание таблицы --
    matrix = transpose(fields); //Транспонируем матрицу
    for (let r in matrix){
        let row = document.createElement('tr');
        for (v in matrix[r]){
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

function showOne(id, name, type){
    let json = JSON.parse(sessionStorage.getItem('blockData')); //Получаем JSON о Блоке
    let body = document.getElementById('objectInfo');
    body.textContent='';
    body.style.height = '62vh';
    document.getElementById('objectMain').style = '15vh';
    //Создание шапки
    let header = document.createElement('div');
    header.classList.add('oneInfo-hedaer');

    //Создание заголовка
    let title = document.createElement('h1');
    title.style.fontFamily = '\'current\'';
    title.style.color = '#186b8f';

    //Создание кнопки сокрытия
    let hButton = document.createElement('button'); //Кнопка сокрытия
    let cImg = document.createElement('div'); //Иконка
    cImg.classList.add('svg-img-64x64');
    cImg.classList.add('img-down-64');
    hButton.onclick=function(){closeObject();};
    hButton.classList.add('svg-btn-64');
    hButton.appendChild(cImg)

    //Собирание заголовка
    title.textContent=name;
    let titleBlock = document.createElement('div')
    titleBlock.appendChild(title);
    header.appendChild(titleBlock);
    header.appendChild(hButton);
    body.appendChild(header);

    //Центральная панель
    let front = document.createElement('div');
    front.classList.add('oneInfo-front');
    body.appendChild(front);

    sessionStorage.setItem('oneName', name)

    //Создание таблицы параметров
    makeOneOpts(front, json)

    

}

function closeObject(){
    $('#objectMain').css('height', '80vh');
    $('#objectInfo').css('height', '0vh');
    window.vanish = setTimeout(function(){
        document.querySelector('#objectInfo').textContent='';
    },200);
}

function makeOneOpts(front, json){
    let oName = sessionStorage.getItem('oneName'); //Получаем ID Обзора
    let optBlock = document.createElement('div');
    optBlock.id = 'oneOptBlock'
    front.appendChild(optBlock)

    let blockTitle = document.createElement('div');

    let img = document.createElement('div'); //блок изображения
    img.classList.add('svg-img-24x24');
    img.classList.add('img-right');
    img.id='oneOptSwitch';

    let hButton = document.createElement('button')
    hButton.appendChild(img);
    hButton.classList.add('svg-btn');
    hButton.type = 'button';

    let title = document.createElement('h3');
    title.textContent = 'Лист настроек';

    blockTitle.appendChild(title);
    blockTitle.appendChild(hButton);

    optBlock.appendChild(blockTitle);

    let div = document.createElement('div')
    optBlock.appendChild(div);

    let table = document.createElement('table');
    table.id='oneOptTable'
    div.appendChild(table);

    let hRow = document.createElement('tr');
    hRow.id='oneOptTableHeadRow'
    table.appendChild(hRow);


    let hName = document.createElement('th'); 
    let hValue = document.createElement('th');
    let hAction = document.createElement('th');
    hAction.classList.add('oneOptsEdit');
    hAction.classList.add('hidden');

    hName.textContent='Параметр';
    hValue.textContent='Значение';
    hRow.appendChild(hAction);
    hRow.appendChild(hName);
    hRow.appendChild(hValue);

    table.appendChild(hRow);
    sessionStorage.setItem('openTable', table.id);
    hButton.onclick=function(){oneOptsOpen(true, hButton)};
    //Наполнение таблицы
    for (let key in json[oName]['options']) {
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
        button.onclick=function(){oneOptEdit(row, true)};


        push.classList.add('oneOptsEdit');
        push.classList.add('hidden');
        push.appendChild(button);

        //Наполнение ячеек контентом
        name.textContent=key;
        value.textContent=json[oName]['options'][key];

        //Вставка ранее созданных элементов в строку
        row.appendChild(push);
        row.appendChild(name);
        row.appendChild(value);
    };
}