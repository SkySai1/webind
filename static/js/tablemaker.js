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
    row.style.transition = '1s';
    fRow.after(row);
    window.vanish = setTimeout(function(){
        row.classList.remove('newRow');;
    },500);
}