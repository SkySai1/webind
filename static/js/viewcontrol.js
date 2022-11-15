function get_views_list(){
    $('#preloader').addClass('preloader-right');
    $('#preloader').addClass('preloader-active');
    $('.right_pannel').removeClass("right_pannel_move");
    clearTimeout(window.vanish);
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
            $('#preloader').addClass('opacity');
            window.vanish = setTimeout(function(){
                $('#preloader').removeClass('preloader-active');
                $('#preloader').removeClass('preloader-right');
                $('#preloader').removeClass('opacity');
                rightshow('#views')
            },300);
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
    //Таблица Обзоров
    const $views_table = document.createElement('table');
    //$views_table.classList.add('servtable');
    $body.appendChild($views_table)

    //Заголовок таблицы
    const $head = document.createElement('tr');
    $views_table.appendChild($head);
    const $id = document.createElement('th');
    const $name = document.createElement('th');
    $id.textContent='ID';
    $name.textContent='Наименование';
    $head.appendChild($id);
    $head.appendChild($name);
    for (key in viewsList) {
        let view = key;
        viewCap = key.split(':');
        //Создание строки
        let row = document.createElement('tr');
        $views_table.appendChild(row);

        //Создание ячеек
        let id = document.createElement('td'); //ID Обзора
        let name = document.createElement('td'); //Наименование
        let push = document.createElement('td'); //Ячейки кнопки
        let button = document.createElement('button'); //Кнопка

        //Функции новой кнопки
        button.textContent='Push';
        button.onclick=function(){showView(view);};

        id.textContent=viewCap[0]+':';
        name.textContent=viewCap[1];

        //Вставка ранее созданных элементов в строку
        push.appendChild(button);
        row.appendChild(id);
        row.appendChild(name);
        row.appendChild(push);
    };
}

function showView(id){
    let saved = sessionStorage.getItem('viewsData');
    var viewsList = JSON.parse(saved)
    console.log(viewsList[id])

    //Создание формы
    let body = document.querySelector('#viewsInfo');
    body.textContent='';
    let title = document.createElement('h1');
    title.textContent=id;
    body.appendChild(title)

}